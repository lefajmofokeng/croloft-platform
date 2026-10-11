'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptSecret } from '@/lib/credential-crypto'

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