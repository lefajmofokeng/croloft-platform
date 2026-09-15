import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

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
      </p>

      <div className="mb-6 rounded border p-4">
        <h2 className="mb-2 font-semibold">Client</h2>
        <p>{quote.client_name}</p>
        <p className="text-sm text-gray-500">{quote.client_email}</p>
        {quote.client_phone && <p className="text-sm text-gray-500">{quote.client_phone}</p>}
      </div>

      <div className="mb-6 rounded border p-4">
        <h2 className="mb-2 font-semibold">{quote.product_name}</h2>
        <div className="space-y-1">
          {lineItems.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600">
              <span>{item.label}</span>
              <span>R{item.price.toFixed(2)}{item.recurring ? '/mo' : ''}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t pt-3">
          <div className="flex justify-between font-medium">
            <span>Once-off total</span>
            <span>R{quote.once_off_total}</span>
          </div>
          {quote.monthly_total > 0 && (
            <div className="flex justify-between font-medium">
              <span>Monthly total</span>
              <span>R{quote.monthly_total}/mo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}