'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptSecret } from '@/lib/credential-crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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