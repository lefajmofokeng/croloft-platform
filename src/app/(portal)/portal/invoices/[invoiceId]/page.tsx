import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type LineItem = { label: string; price: number }

const statusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default async function PortalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (!invoice) {
    notFound()
  }

  const lineItems = invoice.line_items as LineItem[]

  return (
    <div className="p-8 max-w-2xl">
      <a href="/portal/invoices" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to invoices
      </a>

      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{invoice.title}</h1>
        <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[invoice.status]}`}>
          {invoice.status}
        </span>
      </div>
      <p className="mb-6 text-sm text-gray-500">{invoice.invoice_number}</p>

      <div className="mb-6 rounded border p-4">
        <div className="space-y-1">
          {lineItems.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600">
              <span>{item.label}</span>
              <span>R{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>R{invoice.total}</span>
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500">
        <span>Issued: {invoice.issue_date}</span>
        {invoice.due_date && <span>Due: {invoice.due_date}</span>}
      </div>
    </div>
  )
}