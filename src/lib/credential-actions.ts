'use server'

import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptSecret } from '@/lib/credential-crypto'
import {
  createUnlockToken,
  isUnlockTokenValid,
  UNLOCK_COOKIE,
  UNLOCK_SECONDS,
} from '@/lib/credential-unlock'

type SecretField = 'password' | 'notes'
type SecretAction = 'reveal' | 'copy'

export async function getCredentialSecret(
  credentialId: string,
  field: SecretField,
  action: SecretAction
): Promise<{ value?: string; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  // Row-level security already limits what this can return
  // (admins: everything, clients: only their own shared credentials)...
  const { data: cred } = await supabase
    .from('access_credentials')
    .select('id, client_id, shared_with_client, system_name, password_encrypted, secret_notes_encrypted')
    .eq('id', credentialId)
    .single()

  if (!cred) return { error: 'Credential not found' }

  // ...and we check again here in code, because the next step decrypts it.
  const isAdmin = profile.role === 'admin'
  const isOwnerAndShared = cred.client_id === user.id && cred.shared_with_client === true
  if (!isAdmin && !isOwnerAndShared) return { error: 'Not authorized' }

  // Clients must have confirmed their password in the last few minutes (admins are exempt)
  if (!isAdmin) {
    const cookieStore = await cookies()
    if (!isUnlockTokenValid(cookieStore.get(UNLOCK_COOKIE)?.value, user.id)) {
      return { error: 'password_required' }
    }
  }

  const encrypted = field === 'password' ? cred.password_encrypted : cred.secret_notes_encrypted
  if (!encrypted) return { error: 'Nothing stored' }

  let value: string
  try {
    value = decryptSecret(encrypted)
  } catch {
    return { error: 'Could not decrypt. Is the encryption key correct?' }
  }

  // Record the access BEFORE handing the secret over. If logging fails, show nothing.
  const admin = createAdminClient()
  const { error: logError } = await admin.from('credential_access_log').insert({
    credential_id: cred.id,
    system_name: cred.system_name,
    accessed_by: user.id,
    accessed_by_name: profile.full_name || profile.email,
    accessor_role: isAdmin ? 'admin' : 'client',
    action: `${action}_${field}`,
  })

  if (logError) return { error: 'Could not record this access, so the secret was not shown' }

  return { value }
}

// The client confirms their account password; on success they stay unlocked for a few minutes
export async function unlockCredentials(password: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  // Accounts that only ever signed in with Google have no password to check
  const providers: string[] = user.app_metadata?.providers || []
  if (!providers.includes('email')) return { error: 'no_password' }

  const admin = createAdminClient()

  // Too many wrong attempts lately?
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { count } = await admin
    .from('credential_access_log')
    .select('id', { count: 'exact', head: true })
    .eq('accessed_by', user.id)
    .eq('action', 'unlock_failed')
    .gte('created_at', since)

  if ((count || 0) >= 5) {
    return { error: 'Too many wrong attempts. Please wait 15 minutes and try again.' }
  }

  // Check the password with a separate, throwaway client so the user's real session is untouched
  const verifier = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )

  const { error: signInError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password,
  })

  const logBase = {
    credential_id: null,
    system_name: 'Credentials unlock',
    accessed_by: user.id,
    accessed_by_name: profile.full_name || profile.email,
    accessor_role: profile.role === 'admin' ? 'admin' : 'client',
  }

  if (signInError) {
    await admin.from('credential_access_log').insert({ ...logBase, action: 'unlock_failed' })
    return { error: 'That password is not correct.' }
  }

  // Close the throwaway session (local scope only, so it can never sign the real user out)
  await verifier.auth.signOut({ scope: 'local' })

  await admin.from('credential_access_log').insert({ ...logBase, action: 'unlock_ok' })

  const cookieStore = await cookies()
  cookieStore.set(UNLOCK_COOKIE, createUnlockToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: UNLOCK_SECONDS,
  })

  return { ok: true }
}