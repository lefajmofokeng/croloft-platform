'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptSecret } from '@/lib/credential-crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null

  return { supabase, user }
}

export async function createCredential(formData: FormData): Promise<void> {
  const auth = await requireAdmin()
  if (!auth) return
  const { supabase } = auth

  const client_id = (formData.get('client_id') as string) || ''
  const guest_name = formData.get('guest_name') as string
  const guest_email = formData.get('guest_email') as string
  const project_id = (formData.get('project_id') as string) || ''
  const system_name = formData.get('system_name') as string
  const type = (formData.get('type') as string) || 'application'
  const environment = (formData.get('environment') as string) || ''
  const url = formData.get('url') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const tenant = formData.get('tenant') as string
  const role_access = formData.get('role_access') as string
  const mfa_notes = formData.get('mfa_notes') as string
  const secret_notes = formData.get('secret_notes') as string
  const last_changed = formData.get('last_changed') as string
  const shared_with_client = formData.get('shared_with_client') === 'on'

  if (!system_name?.trim()) return
  if (!client_id && !guest_name?.trim()) return

  await supabase.from('access_credentials').insert({
    client_id: client_id || null,
    guest_name: client_id ? null : guest_name.trim(),
    guest_email: client_id ? null : guest_email?.trim() || null,
    project_id: project_id || null,
    system_name: system_name.trim(),
    type,
    environment: environment || null,
    url: url?.trim() || null,
    username: username?.trim() || null,
    password_encrypted: password ? encryptSecret(password) : null,
    tenant: tenant?.trim() || null,
    role_access: role_access?.trim() || null,
    mfa_notes: mfa_notes?.trim() || null,
    secret_notes_encrypted: secret_notes?.trim() ? encryptSecret(secret_notes) : null,
    last_changed: last_changed || null,
    shared_with_client,
  })

  revalidatePath('/admin/credentials')
  redirect('/admin/credentials')
}

export async function updateCredential(formData: FormData): Promise<void> {
  const auth = await requireAdmin()
  if (!auth) return
  const { supabase, user } = auth

  const id = formData.get('id') as string
  const project_id = (formData.get('project_id') as string) || ''
  const system_name = formData.get('system_name') as string
  const type = (formData.get('type') as string) || 'application'
  const environment = (formData.get('environment') as string) || ''
  const url = formData.get('url') as string
  const username = formData.get('username') as string
  const tenant = formData.get('tenant') as string
  const role_access = formData.get('role_access') as string
  const mfa_notes = formData.get('mfa_notes') as string
  const last_changed = formData.get('last_changed') as string
  const new_password = formData.get('password') as string
  const clear_password = formData.get('clear_password') === 'on'
  const new_notes = formData.get('secret_notes') as string
  const clear_notes = formData.get('clear_notes') === 'on'
  const wants_shared = formData.get('shared_with_client') === 'on'

  if (!id || !system_name?.trim()) return

  const { data: existing } = await supabase
    .from('access_credentials')
    .select('client_id, shared_with_client')
    .eq('id', id)
    .single()

  if (!existing) return

  // Guest credentials can't be shared (there's no account to share with yet)
  const shared_with_client = existing.client_id ? wants_shared : false

  const updates: Record<string, unknown> = {
    project_id: project_id || null,
    system_name: system_name.trim(),
    type,
    environment: environment || null,
    url: url?.trim() || null,
    username: username?.trim() || null,
    tenant: tenant?.trim() || null,
    role_access: role_access?.trim() || null,
    mfa_notes: mfa_notes?.trim() || null,
    last_changed: last_changed || null,
    shared_with_client,
  }

  const events: string[] = []

  if (clear_password) {
    updates.password_encrypted = null
    events.push('password_removed')
  } else if (new_password) {
    updates.password_encrypted = encryptSecret(new_password)
    events.push('password_changed')
  }

  if (clear_notes) {
    updates.secret_notes_encrypted = null
    events.push('notes_removed')
  } else if (new_notes?.trim()) {
    updates.secret_notes_encrypted = encryptSecret(new_notes)
    events.push('notes_changed')
  }

  if (shared_with_client !== existing.shared_with_client) {
    events.push(shared_with_client ? 'share_on' : 'share_off')
  }

  await supabase.from('access_credentials').update(updates).eq('id', id)

  if (events.length > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const admin = createAdminClient()
    await admin.from('credential_access_log').insert(
      events.map((action) => ({
        credential_id: id,
        system_name: system_name.trim(),
        accessed_by: user.id,
        accessed_by_name: profile?.full_name || profile?.email,
        accessor_role: 'admin',
        action,
      }))
    )
  }

  revalidatePath('/admin/credentials')
  redirect('/admin/credentials')
}

export async function deleteCredential(formData: FormData): Promise<void> {
  const auth = await requireAdmin()
  if (!auth) return
  const { supabase, user } = auth

  const id = formData.get('id') as string
  if (!id) return

  const { data: existing } = await supabase
    .from('access_credentials')
    .select('system_name')
    .eq('id', id)
    .single()

  if (!existing) return

  // Log the deletion first. The log keeps the system name, so it stays readable afterwards.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const admin = createAdminClient()
  await admin.from('credential_access_log').insert({
    credential_id: id,
    system_name: existing.system_name,
    accessed_by: user.id,
    accessed_by_name: profile?.full_name || profile?.email,
    accessor_role: 'admin',
    action: 'deleted',
  })

  await supabase.from('access_credentials').delete().eq('id', id)

  revalidatePath('/admin/credentials')
  redirect('/admin/credentials')
}