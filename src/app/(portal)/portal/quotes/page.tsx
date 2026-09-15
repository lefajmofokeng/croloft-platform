import { createClient } from '@/lib/supabase/server'

export default async function PortalQuotesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user!.id)
    .single()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .or(`user_id.eq.${user!.id},client_email.eq.${profile?.email}`)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Quotes</h1>

      {quotes && quotes.length > 0 ? (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <a
              key={quote.id}
              href={`/portal/quotes/${quote.id}`}
              className="block rounded border p-4 hover:border-blue-400 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{quote.product_name}</p>
                  <p className="text-xs text-gray-400">{quote.quote_ref}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R{quote.once_off_total}</p>
                  {quote.monthly_total > 0 && (
                    <p className="text-xs text-gray-500">+ R{quote.monthly_total}/mo</p>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(quote.created_at).toLocaleDateString('en-ZA')}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No quotes yet. Visit our{' '}
          <a href="/pricing" className="text-blue-600 hover:underline">
            pricing calculator
          </a>{' '}
          to build an estimate.
        </p>
      )}
    </div>
  )
}