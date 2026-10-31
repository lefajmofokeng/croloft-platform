'use server'

import { createClient } from '@/lib/supabase/server'
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

  return supabase
}

export async function createAsset(formData: FormData): Promise<void> {
  const supabase = await requireAdmin()
  if (!supabase) return

  const client_id = (formData.get('client_id') as string) || ''
  const guest_name = formData.get('guest_name') as string
  const guest_email = formData.get('guest_email') as string
  const project_id = (formData.get('project_id') as string) || ''
  const asset_type = (formData.get('asset_type') as string) || 'other'
  const name = formData.get('name') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const serial_number = formData.get('serial_number') as string
  const location = formData.get('location') as string
  const purchase_date = formData.get('purchase_date') as string
  const warranty_expiry = formData.get('warranty_expiry') as string
  const status = (formData.get('status') as string) || 'active'
  const notes = formData.get('notes') as string

  if (!name?.trim()) return
  if (!client_id && !guest_name?.trim()) return

  await supabase.from('assets').insert({
    client_id: client_id || null,
    guest_name: client_id ? null : guest_name.trim(),
    guest_email: client_id ? null : guest_email?.trim() || null,
    project_id: project_id || null,
    asset_type,
    name: name.trim(),
    make: make?.trim() || null,
    model: model?.trim() || null,
    serial_number: serial_number?.trim() || null,
    location: location?.trim() || null,
    purchase_date: purchase_date || null,
    warranty_expiry: warranty_expiry || null,
    status,
    notes: notes?.trim() || null,
  })

  revalidatePath('/admin/assets')
  redirect('/admin/assets')
}

export async function deleteAsset(formData: FormData): Promise<void> {
  const supabase = await requireAdmin()
  if (!supabase) return

  const id = formData.get('id') as string
  if (!id) return

  await supabase.from('assets').delete().eq('id', id)

  revalidatePath('/admin/assets')
}

export async function updateAsset(formData: FormData): Promise<void> {
  const supabase = await requireAdmin()
  if (!supabase) return

  const id = formData.get('id') as string
  const project_id = (formData.get('project_id') as string) || ''
  const asset_type = (formData.get('asset_type') as string) || 'other'
  const name = formData.get('name') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const serial_number = formData.get('serial_number') as string
  const location = formData.get('location') as string
  const purchase_date = formData.get('purchase_date') as string
  const warranty_expiry = formData.get('warranty_expiry') as string
  const status = (formData.get('status') as string) || 'active'
  const notes = formData.get('notes') as string

  if (!id || !name?.trim()) return

  await supabase
    .from('assets')
    .update({
      project_id: project_id || null,
      asset_type,
      name: name.trim(),
      make: make?.trim() || null,
      model: model?.trim() || null,
      serial_number: serial_number?.trim() || null,
      location: location?.trim() || null,
      purchase_date: purchase_date || null,
      warranty_expiry: warranty_expiry || null,
      status,
      notes: notes?.trim() || null,
    })
    .eq('id', id)

  revalidatePath('/admin/assets')
  redirect('/admin/assets')
}