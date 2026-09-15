import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { addAdminReply, getAttachmentUrl, updateTicketStatus } from '../actions'
import TicketReplyForm from '@/components/ticket-reply-form'
import TicketAttachmentThumbnail from '@/components/ticket-attachment-thumbnail'

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const supabase = await createClient()

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*, profiles(full_name, email), projects(name)')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    notFound()
  }

  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('*, ticket_message_attachments(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[ticket.status]}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      <p className="mb-6 text-sm capitalize text-gray-500">
        {ticket.profiles?.full_name || ticket.profiles?.email} • {ticket.projects?.name || 'General Inquiry'} • Priority: {ticket.priority}
      </p>

      <div className="mb-6 space-y-3">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded border p-3 ${
              msg.author_role === 'admin' ? 'bg-blue-50' : 'bg-white'
            }`}
          >
            <p className="mb-1 text-xs font-medium text-gray-500">
              {msg.author_role === 'admin' ? 'You (Croloft Support)' : 'Client'}
            </p>
          <p className="text-sm">{msg.message}</p>
            {msg.ticket_message_attachments?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.ticket_message_attachments.map((att: { id: string; storage_path: string; file_name: string }) => (
                  <TicketAttachmentThumbnail
                    key={att.id}
                    storagePath={att.storage_path}
                    fileName={att.file_name}
                    getUrl={getAttachmentUrl}
                  />
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {new Date(msg.created_at).toLocaleString('en-ZA')}
            </p>
          </div>
        ))}
      </div>

      <TicketReplyForm action={addAdminReply} ticketId={ticket.id} />

      <form action={updateTicketStatus} className="flex items-center gap-3 rounded border p-4">
        <input type="hidden" name="id" value={ticket.id} />
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select name="status" defaultValue={ticket.status} className="rounded border border-gray-300 p-2 text-sm">
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          Update Status
        </button>
      </form>
    </div>
  )
}