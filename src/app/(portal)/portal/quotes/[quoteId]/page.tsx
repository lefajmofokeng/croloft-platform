import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { acceptQuote } from '../actions'

type LineItem = { label: string; price: number; recurring?: boolean }

export default async function PortalQuoteDetailPage({
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
      <a href="/portal/quotes" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to quotes
      </a>

      <h1 className="mb-1 text-2xl font-bold">{quote.product_name}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {quote.quote_ref} • {new Date(quote.created_at).toLocaleString('en-ZA')}
      </p>

      <div className="rounded border p-4">
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

      {quote.accepted_at ? (
        <p className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          ✓ Accepted on {new Date(quote.accepted_at).toLocaleDateString('en-ZA')}
        </p>
      ) : (
        <form action={acceptQuote} className="mt-4">
          <input type="hidden" name="quote_id" value={quote.id} />
          <button type="submit" className="w-full rounded bg-green-600 py-2 text-white">
            Accept This Quote
          </button>
        </form>
      )}
      </div>
    </div>
  )
}