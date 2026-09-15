import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
}

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-yellow-600',
  high: 'text-red-600',
}

export default async function AdminSupportPage() {
  const supabase = await createClient()

    const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, profiles(full_name, email), projects(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Support Tickets</h1>

      <div className="space-y-2">
        {tickets?.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/admin/support/${ticket.id}`}
            className="block rounded border p-4 hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{ticket.subject}</p>
                <p className="text-sm text-gray-500">
                  {ticket.profiles?.full_name || ticket.profiles?.email} • {ticket.projects?.name || 'General Inquiry'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={`font-medium capitalize ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tickets?.length === 0 && <p className="text-gray-500">No support tickets yet.</p>}
    </div>
  )
}