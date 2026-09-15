'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function addClientReply(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const ticket_id = formData.get('ticket_id') as string
  const message = formData.get('message') as string
  const files = formData.getAll('attachments') as File[]

  if (!ticket_id || !message?.trim()) return

  // Verify this client actually owns the ticket before touching storage
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('client_id')
    .eq('id', ticket_id)
    .single()

  if (!ticket || ticket.client_id !== user.id) return

  const { data: newMessage, error } = await supabase
    .from('ticket_messages')
    .insert({ ticket_id, author_role: 'client', message: message.trim() })
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

  revalidatePath(`/portal/support/${ticket_id}`)
}

export async function createTicket(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const subject = formData.get('subject') as string
  const priority = formData.get('priority') as string
  const message = formData.get('message') as string
  const project_id = formData.get('project_id') as string

  if (!subject?.trim() || !message?.trim()) return

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      client_id: user.id,
      subject: subject.trim(),
      priority,
      project_id: project_id || null,
    })
    .select()
    .single()

  if (error || !ticket) return

  await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    author_role: 'client',
    message: message.trim(),
  })

  revalidatePath('/portal/support')
  redirect(`/portal/support/${ticket.id}`)
}

export async function getAttachmentUrl(storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // storagePath looks like: {ticketId}/{messageId}/{filename}
  const ticketId = storagePath.split('/')[0]

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('client_id')
    .eq('id', ticketId)
    .single()

  if (!ticket || ticket.client_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('ticket-attachments')
    .createSignedUrl(storagePath, 60)

  if (error || !data) return { error: 'Could not load attachment' }
  return { url: data.signedUrl }
}