import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateInvoiceStatus, deleteInvoice } from '../actions'
import ConfirmSubmitButton from '@/components/confirm-submit-button';

type LineItem = { label: string; price: number }

const statusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, profiles(full_name, email)')
    .eq('id', invoiceId)
    .single()

  if (!invoice) {
    notFound()
  }

  const lineItems = invoice.line_items as LineItem[]

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{invoice.title}</h1>
        <span className={`rounded px-2 py-1 text-xs capitalize ${statusColors[invoice.status]}`}>
          {invoice.status}
        </span>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        {invoice.invoice_number} • {invoice.profiles?.full_name || invoice.profiles?.email}
      </p>

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

      <div className="mb-6 flex gap-6 text-sm text-gray-500">
        <span>Issued: {invoice.issue_date}</span>
        {invoice.due_date && <span>Due: {invoice.due_date}</span>}
      </div>

      <form action={updateInvoiceStatus} className="mb-4 flex items-center gap-3 rounded border p-4">
        <input type="hidden" name="id" value={invoice.id} />
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select name="status" defaultValue={invoice.status} className="rounded border border-gray-300 p-2 text-sm">
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          Update Status
        </button>
      </form>

    <ConfirmSubmitButton
        action={deleteInvoice}
        hiddenFields={{ id: invoice.id }}
        buttonLabel="Delete Invoice"
        buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
        confirmTitle="Delete this invoice?"
        confirmMessage="This cannot be undone."
      />
    </div>
  )
}