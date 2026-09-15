'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function addAdminReply(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const ticket_id = formData.get('ticket_id') as string
  const message = formData.get('message') as string
  const files = formData.getAll('attachments') as File[]

  if (!ticket_id || !message?.trim()) return

  const { data: newMessage, error } = await supabase
    .from('ticket_messages')
    .insert({ ticket_id, author_role: 'admin', message: message.trim() })
    .select()
    .single()

  if (error || !newMessage) return

  const admin = createAdminClient()

  for (const file of files) {
    if (!file || file.size === 0) continue
    const storagePath = `${ticket_id}/${newMessage.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await admin.storage
      .from('ticket-attachments')
      .upload(storagePath, file)

    if (!uploadError) {
      await admin.from('ticket_message_attachments').insert({
        message_id: newMessage.id,
        storage_path: storagePath,
        file_name: file.name,
      })
    }
  }

  revalidatePath(`/admin/support/${ticket_id}`)
}

export async function updateTicketStatus(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!id || !status) return

  await supabase.from('support_tickets').update({ status }).eq('id', id)

  revalidatePath(`/admin/support/${id}`)
}

export async function getAttachmentUrl(storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('ticket-attachments')
    .createSignedUrl(storagePath, 60)

  if (error || !data) return { error: 'Could not load attachment' }
  return { url: data.signedUrl }
}
