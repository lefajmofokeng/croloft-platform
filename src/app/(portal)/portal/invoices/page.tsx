import { createClient } from '@/lib/supabase/server'

const statusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default async function PortalInvoicesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Invoices</h1>

      <div className="space-y-2">
        {invoices?.map((invoice) => (
          <a
            key={invoice.id}
            href={`/portal/invoices/${invoice.id}`}
            className="block rounded border p-4 hover:border-blue-400 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{invoice.title}</p>
                <p className="text-sm text-gray-500">{invoice.invoice_number}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">R{invoice.total}</span>
                <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {invoices?.length === 0 && <p className="text-gray-500">No invoices yet.</p>}
    </div>
  )
}