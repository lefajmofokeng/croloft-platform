'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Client = { id: string; full_name: string | null; email: string | null }
type Product = { id: string; name: string }
type Category = { id: string; name: string; pricing_products: Product[] }

export default function StartQuoteForm({
  clients,
  categories,
}: {
  clients: Client[]
  categories: Category[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'existing' | 'guest'>('existing')
  const [clientId, setClientId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [productId, setProductId] = useState('')

  const canContinue =
    productId && (mode === 'existing' ? !!clientId : guestName.trim() && guestEmail.trim())

  function handleContinue() {
    if (!canContinue) return

    const params = new URLSearchParams()
    if (mode === 'existing') {
      params.set('clientId', clientId)
    } else {
      params.set('guestName', guestName.trim())
      params.set('guestEmail', guestEmail.trim())
      if (guestPhone.trim()) params.set('guestPhone', guestPhone.trim())
    }

    router.push(`/admin/quotes/new/${productId}?${params.toString()}`)
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <div className="mt-1 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
            Existing client
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'guest'} onChange={() => setMode('guest')} />
            New / guest client (not signed up)
          </label>
        </div>
      </div>

      {mode === 'existing' ? (
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name || client.email}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-3 rounded border bg-gray-50 p-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Phone (optional)</label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <p className="text-xs text-gray-400">
            This quote won&apos;t be linked to a portal account. If they sign up later with the same email, it&apos;ll automatically appear in their portal.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a product</option>
          {categories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              {category.pricing_products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}