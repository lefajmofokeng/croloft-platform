'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadProjectDocument(formData: FormData): Promise<void> {
  const supabase = await createClient()

  // Verify the requester is actually an admin before touching storage
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return

  const project_id = formData.get('project_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const file = formData.get('file') as File

  if (!project_id || !name?.trim() || !file || file.size === 0) return

  const admin = createAdminClient()
  const storagePath = `${project_id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await admin.storage
    .from('project-documents')
    .upload(storagePath, file)

  if (uploadError) return

  await admin.from('project_documents').insert({
    project_id,
    name: name.trim(),
    description: description?.trim() || null,
    storage_path: storagePath,
  })

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function createProject(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const client_id = formData.get('client_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const start_date = formData.get('start_date') as string
  const target_completion_date = formData.get('target_completion_date') as string

  if (!client_id || !name?.trim()) return

  await supabase.from('projects').insert({
    client_id,
    name: name.trim(),
    description: description?.trim() || null,
    status,
    start_date: start_date || null,
    target_completion_date: target_completion_date || null,
  })

  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function updateProject(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const start_date = formData.get('start_date') as string
  const target_completion_date = formData.get('target_completion_date') as string

  if (!id || !name?.trim()) return

  await supabase
    .from('projects')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      status,
      start_date: start_date || null,
      target_completion_date: target_completion_date || null,
    })
    .eq('id', id)

  revalidatePath(`/admin/projects/${id}`)
}

export async function deleteProject(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  if (!id) return

  await supabase.from('projects').delete().eq('id', id)

  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function addProjectUpdate(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const project_id = formData.get('project_id') as string
  const note = formData.get('note') as string

  if (!project_id || !note?.trim()) return

  await supabase.from('project_updates').insert({
    project_id,
    note: note.trim(),
  })

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function updateProjectDocument(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id = formData.get('id') as string
  const project_id = formData.get('project_id') as string
  const old_storage_path = formData.get('old_storage_path') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const file = formData.get('file') as File | null

  if (!id || !name?.trim()) return

  const admin = createAdminClient()

  const updates: {
    name: string
    description: string | null
    storage_path?: string
  } = {
    name: name.trim(),
    description: description?.trim() || null,
  }

  // Only touch the file if a new one was actually selected
  if (file && file.size > 0) {
    const newStoragePath = `${project_id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await admin.storage
      .from('project-documents')
      .upload(newStoragePath, file)

    if (uploadError) return

    // Remove the old file only after the new one uploads successfully
    await admin.storage.from('project-documents').remove([old_storage_path])

    updates.storage_path = newStoragePath
  }

  await supabase.from('project_documents').update(updates).eq('id', id)

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function deleteProjectDocument(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id = formData.get('id') as string
  const project_id = formData.get('project_id') as string
  const storage_path = formData.get('storage_path') as string

  if (!id) return

  const admin = createAdminClient()
  await admin.storage.from('project-documents').remove([storage_path])
  await admin.from('project_documents').delete().eq('id', id)

  revalidatePath(`/admin/projects/${project_id}`)
}