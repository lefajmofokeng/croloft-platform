import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuotePricingTable from '@/components/quote-pricing-table'

type LineItem = { label: string; price: number; recurring?: boolean }

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>
}) {
  const { quoteId } = await params
  const supabase = await createClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()

  if (!quote) {
    notFound()
  }

  const lineItems = quote.line_items as LineItem[]

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Quote {quote.quote_ref}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {new Date(quote.created_at).toLocaleString('en-ZA')}
        {quote.accepted_at && (
          <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
            Accepted {new Date(quote.accepted_at).toLocaleDateString('en-ZA')}
          </span>
        )}
      </p>

      <a
        href={`/admin/quotes/${quote.id}/convert`}
        className="mb-6 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white"
      >
        Convert to Project
      </a>

      <div className="mb-6 rounded border p-4">
        <h2 className="mb-2 font-semibold">Client</h2>
        <p>{quote.client_name}</p>
        <p className="text-sm text-gray-500">{quote.client_email}</p>
        {quote.client_phone && <p className="text-sm text-gray-500">{quote.client_phone}</p>}
      </div>

      <div className="mb-6 rounded border p-4">
        <h2 className="mb-3 font-semibold">{quote.product_name}</h2>
        <QuotePricingTable
          lineItems={lineItems}
          hourlyItems={(quote.hourly_items || []) as { label: string; rate: number; unit: string }[]}
          onceOffTotal={quote.once_off_total}
          monthlyTotal={quote.monthly_total}
        />
      </div>
    </div>
  )
}