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
  const [clientId, setClientId] = useState('')
  const [productId, setProductId] = useState('')

  function handleContinue() {
    if (!clientId || !productId) return
    router.push(`/admin/quotes/new/${productId}?clientId=${clientId}`)
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name || client.email}
            </option>
          ))}
        </select>
      </div>

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
        disabled={!clientId || !productId}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}