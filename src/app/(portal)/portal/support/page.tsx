import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
}

export default async function SupportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

   const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, projects(name)')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Link href="/portal/support/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + New Ticket
        </Link>
      </div>

      <div className="space-y-2">
        {tickets?.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/portal/support/${ticket.id}`}
            className="block rounded border p-4 hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
                <p className="font-medium">{ticket.subject}</p>
                <p className="text-xs text-gray-400">{ticket.projects?.name || 'General Inquiry'}</p>
              <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[ticket.status]}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(ticket.created_at).toLocaleDateString('en-ZA')}
            </p>
          </Link>
        ))}
      </div>

      {tickets?.length === 0 && <p className="text-gray-500">No support tickets yet.</p>}
    </div>
  )
}