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

  // Best client match: direct link first, otherwise try the quote's email against client profiles
  let matchedClientId = quote.user_id

  if (!matchedClientId && quote.client_email) {
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
            <select
              name="client_id"
              defaultValue={matchedClientId || ''}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            >
              <option value="">No account — keep as guest client</option>
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
              {quote.client_email
                ? `No account found for ${quote.client_email}. The project will be created as a guest project for ${quote.client_name}, and will link to their account automatically if they sign up with that email.`
                : `This quote has no email, so a guest project for ${quote.client_name} can't link automatically later. Pick an account instead if one exists.`}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input
            type="text"
            name="name"
            defaultValue={quote.product_name}
            required
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={`Converted from quote ${quote.quote_ref}`}
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