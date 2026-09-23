import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) {
    notFound()
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">{client.full_name || client.email}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Client since {new Date(client.created_at).toLocaleDateString('en-ZA')}
      </p>

      <div className="space-y-4 rounded border p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Contact</p>
          <p className="text-sm">{client.email}</p>
          {client.phone && <p className="text-sm">{client.phone}</p>}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Location</p>
          <p className="text-sm">{client.province || '—'}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Account Type</p>
          <p className="text-sm capitalize">{client.account_type || '—'}</p>
        </div>

        {client.account_type === 'business' && (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Industry</p>
              <p className="text-sm">{client.industry || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Company Size</p>
              <p className="text-sm">{client.company_size ? `${client.company_size} employees` : '—'}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}