'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { portalSearch } from './portal-search-actions'

type Results = Awaited<ReturnType<typeof portalSearch>>

export default function PortalSearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Results | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      setOpen(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      const data = await portalSearch(query)
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goTo(path: string) {
    setOpen(false)
    setQuery('')
    router.push(path)
  }

  const totalResults = results
    ? results.projects.length + results.invoices.length + results.quotes.length + results.tickets.length
    : 0

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder="Search your projects, invoices, quotes, tickets..."
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded border bg-white shadow-lg">
          {loading && <p className="p-3 text-sm text-gray-400">Searching...</p>}
          {!loading && totalResults === 0 && <p className="p-3 text-sm text-gray-400">No results found.</p>}

          {!loading && results && (
            <>
              {results.projects.length > 0 && (
                <div className="border-b p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Projects</p>
                  {results.projects.map((p) => (
                    <button key={p.id} onClick={() => goTo(`/portal/projects/${p.id}`)} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{p.project_number}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.invoices.length > 0 && (
                <div className="border-b p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Invoices</p>
                  {results.invoices.map((inv) => (
                    <button key={inv.id} onClick={() => goTo(`/portal/invoices/${inv.id}`)} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                      <span className="font-medium">{inv.title}</span>
                      <span className="ml-2 text-xs text-gray-400">{inv.invoice_number}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.quotes.length > 0 && (
                <div className="border-b p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Quotes</p>
                  {results.quotes.map((quote) => (
                    <button key={quote.id} onClick={() => goTo(`/portal/quotes/${quote.id}`)} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                      <span className="font-medium">{quote.product_name}</span>
                      <span className="ml-2 text-xs text-gray-400">{quote.quote_ref}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.tickets.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Support Tickets</p>
                  {results.tickets.map((ticket) => (
                    <button key={ticket.id} onClick={() => goTo(`/portal/support/${ticket.id}`)} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                      <span className="font-medium">{ticket.subject}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}