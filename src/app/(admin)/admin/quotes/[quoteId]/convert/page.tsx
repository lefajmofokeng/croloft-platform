import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { convertQuoteToProject } from '../../actions'

export default async function ConvertQuotePage({
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

  // Figure out the best client match: direct user_id link first,
  // otherwise try matching the guest email to an existing client profile
  let matchedClientId = quote.user_id

  if (!matchedClientId) {
    const { data: matchedProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', quote.client_email)
      .eq('role', 'client')
      .single()

    matchedClientId = matchedProfile?.id || null
  }

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Convert Quote to Project</h1>
      <p className="mb-6 text-sm text-gray-500">{quote.quote_ref} — {quote.product_name}</p>

      <form action={convertQuoteToProject} className="space-y-4 rounded border p-4">
        <input type="hidden" name="quote_id" value={quote.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          {quote.user_id ? (
            <>
              <input type="hidden" name="client_id" value={quote.user_id} />
              <p className="mt-1 rounded border bg-gray-50 p-2 text-sm">
                {quote.client_name} ({quote.client_email}) — linked account
              </p>
            </>
          ) : (
            <select name="client_id" defaultValue={matchedClientId || ''} required className="mt-1 w-full rounded border border-gray-300 p-2">
              <option value="">Select a client</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name || client.email}
                  {client.email === quote.client_email ? ' (email match)' : ''}
                </option>
              ))}
            </select>
          )}
          {!quote.user_id && !matchedClientId && (
            <p className="mt-1 text-xs text-amber-600">
              No account found matching {quote.client_email} — this quote was submitted as a guest. Select the correct client manually, or ask them to sign up first.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input type="text" name="name" defaultValue={quote.product_name} required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={`Converted from quote ${quote.quote_ref} (R${quote.once_off_total}${quote.monthly_total > 0 ? ` + R${quote.monthly_total}/mo` : ''})`}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Create Project
        </button>
      </form>
    </div>
  )
}