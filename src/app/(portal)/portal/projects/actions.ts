'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getDocumentDownloadUrl(documentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // Fetch the document, but joined through projects so RLS confirms ownership
    const { data: document } = await supabase
    .from('project_documents')
    .select('storage_path, name, projects!inner(client_id)')
    .eq('id', documentId)
    .single()

  if (!document) return { error: 'Document not found' }

  // Extra explicit check, on top of RLS, since we're about to use the admin client
  const project = document.projects as unknown as { client_id: string }
  if (project.client_id !== user.id) {
    return { error: 'Not authorized' }
  }

  // Extract the real file extension from the storage path (after the timestamp prefix)
  const originalFileName = document.storage_path.split('/').pop()?.replace(/^\d+-/, '') || document.name
  const extension = originalFileName.includes('.') ? originalFileName.split('.').pop() : ''
  const downloadFileName = extension ? `${document.name}.${extension}` : document.name

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('project-documents')
    .createSignedUrl(document.storage_path, 60, { download: downloadFileName })

  if (error || !data) return { error: 'Could not generate download link' }

  return { url: data.signedUrl }
}

export async function getClientDocumentVersionUrl(storagePath: string, fileName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // storagePath looks like: {projectId}/{filename} — verify ownership via the project
  const projectId = storagePath.split('/')[0]
  const { data: project } = await supabase.from('projects').select('client_id').eq('id', projectId).single()

  if (!project || project.client_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('project-documents')
    .createSignedUrl(storagePath, 60, { download: fileName })

  if (error || !data) return { error: 'Could not load file' }
  return { url: data.signedUrl }
}