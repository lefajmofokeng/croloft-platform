import { createClient } from '@/lib/supabase/server'

export default async function AdminQuotesPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Quotes</h1>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Ref</th>
              <th className="p-3">Client</th>
              <th className="p-3">Product</th>
              <th className="p-3">Once-off</th>
              <th className="p-3">Monthly</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {quotes?.map((quote) => (
              <tr key={quote.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">
                  <a href={`/admin/quotes/${quote.id}`} className="text-blue-600 hover:underline">
                    {quote.quote_ref}
                  </a>
                </td>
                <td className="p-3">
                  <div>{quote.client_name}</div>
                  <div className="text-xs text-gray-500">{quote.client_email}</div>
                </td>
                <td className="p-3">{quote.product_name}</td>
                <td className="p-3">R{quote.once_off_total}</td>
                <td className="p-3">{quote.monthly_total > 0 ? `R${quote.monthly_total}/mo` : '—'}</td>
                <td className="p-3 text-gray-500">
                  {new Date(quote.created_at).toLocaleDateString('en-ZA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quotes?.length === 0 && <p className="mt-4 text-gray-500">No quotes yet.</p>}
    </div>
  )
}