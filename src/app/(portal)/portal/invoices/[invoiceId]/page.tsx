import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PrintInvoiceButton from './print-invoice-button'
import { summarizeInvoice } from '@/lib/invoice-items'

type LineItem = {
  label: string
  price: number
  cycle?: 'once_off' | 'monthly' | 'hourly'
  rate?: number
}

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

  const { data: { user } } = await supabase.auth.getUser()
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user!.id)
    .single()

  if (!invoice) {
    notFound()
  }

  const lineItems = invoice.line_items as LineItem[]
  const sums = summarizeInvoice(lineItems)

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

            <div className="mb-6 overflow-x-auto rounded border p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Once-off</th>
              <th className="pb-2 text-right font-medium">Monthly</th>
              <th className="pb-2 text-right font-medium">Hourly</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => {
              const cycle = item.cycle || 'once_off'
              return (
                <tr key={i} className="border-b text-gray-600">
                  <td className="py-2 pr-2">{item.label}</td>
                  <td className="py-2 text-right">
                    {cycle === 'once_off' ? `R${item.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 text-right">
                    {cycle === 'monthly' ? `R${item.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 text-right">
                    {cycle === 'hourly' ? (
                      item.price > 0 ? (
                        <>
                          R{item.price.toFixed(2)}
                          <br />
                          <span className="text-xs text-gray-400">R{(item.rate || 0).toFixed(2)}/hr</span>
                        </>
                      ) : (
                        `R${(item.rate || 0).toFixed(2)}/hr`
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-3">Subtotals</td>
              <td className="pt-3 text-right">R{sums.onceOff.toFixed(2)}</td>
              <td className="pt-3 text-right">R{sums.monthly.toFixed(2)}</td>
              <td className="pt-3 text-right">
                {sums.hourly > 0 ? `R${sums.hourly.toFixed(2)}` : 'as worked'}
              </td>
            </tr>
          </tfoot>
        </table>

        {(lineItems.some((i) => i.cycle === 'monthly') || lineItems.some((i) => i.cycle === 'hourly')) && (
          <p className="mt-2 text-xs text-gray-400">
            Monthly amounts are for the first month. Hourly items are billed as worked.
          </p>
        )}

        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>R{invoice.total}</span>
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500">
        <span>Issued: {invoice.issue_date}</span>
        {invoice.due_date && <span>Due: {invoice.due_date}</span>}
      </div>

      <PrintInvoiceButton
        invoiceNumber={invoice.invoice_number}
        title={invoice.title}
        lineItems={lineItems}
        total={invoice.total}
        issueDate={invoice.issue_date}
        dueDate={invoice.due_date}
        status={invoice.status}
        clientName={clientProfile?.full_name || clientProfile?.email || ''}
        clientEmail={clientProfile?.email || ''}
        clientPhone={clientProfile?.phone || ''}
      />
    </div>
  )
}