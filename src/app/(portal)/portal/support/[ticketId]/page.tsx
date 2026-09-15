import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { addClientReply, getAttachmentUrl } from '../actions'
import TicketAttachmentThumbnail from '@/components/ticket-attachment-thumbnail'

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
}

function TicketReplyForm({
  action,
  ticketId,
}: {
  action: (formData: FormData, ticketId: string) => Promise<void> | void
  ticketId: string
}) {
  return (
    <form
      action={async (formData: FormData) => {
        await action(formData, ticketId)
      }}
      className="space-y-3 rounded border bg-white p-4"
    >
      <label className="block text-sm font-medium text-gray-700">
        Reply
        <textarea
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Write a reply..."
        />
      </label>
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Send reply
      </button>
    </form>
  )
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const supabase = await createClient()

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*, projects(name)')
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

  const isClosed = ticket.status === 'closed'

  return (
    <div className="p-8 max-w-2xl">
      <a href="/portal/support" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to tickets
      </a>

      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[ticket.status]}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      <p className="mb-6 text-sm capitalize text-gray-500">
        {ticket.projects?.name || 'General Inquiry'} • Priority: {ticket.priority}
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
              {msg.author_role === 'admin' ? 'Croloft Support' : 'You'}
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

      {isClosed ? (
        <p className="rounded border bg-gray-50 p-4 text-sm text-gray-500">
          This ticket is closed. Please open a new ticket if you need further help.
        </p>
      ) : (

      <TicketReplyForm action={addClientReply} ticketId={ticket.id} />
      )}
    </div>
  )
}