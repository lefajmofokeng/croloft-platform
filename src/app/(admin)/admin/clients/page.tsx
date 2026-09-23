import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Clients</h1>

      <div className="space-y-2">
        {clients?.map((client) => (
          <Link
            key={client.id}
            href={`/admin/clients/${client.id}`}
            className="block rounded border p-4 hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{client.full_name || client.email}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">
                {client.account_type || '—'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {clients?.length === 0 && <p className="text-gray-500">No clients yet.</p>}
    </div>
  )
}