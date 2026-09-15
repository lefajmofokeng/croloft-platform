import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default async function AdminInvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/admin/invoices/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Create Invoice
        </Link>
      </div>

      <div className="space-y-2">
        {invoices?.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/admin/invoices/${invoice.id}`}
            className="block rounded border p-4 hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{invoice.title}</p>
                <p className="text-sm text-gray-500">
                  {invoice.profiles?.full_name || invoice.profiles?.email} • {invoice.invoice_number}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">R{invoice.total}</span>
                <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {invoices?.length === 0 && <p className="text-gray-500">No invoices yet.</p>}
    </div>
  )
}