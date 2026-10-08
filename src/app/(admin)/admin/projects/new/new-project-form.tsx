'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '../actions'

type Client = { id: string; full_name: string | null; email: string | null }
type Product = { id: string; name: string }
type Category = { id: string; name: string; pricing_products: Product[] }

export default function NewProjectForm({
  clients,
  categories,
}: {
  clients: Client[]
  categories: Category[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'existing' | 'guest'>('existing')
  const [attachPricing, setAttachPricing] = useState(false)

  const [clientId, setClientId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [productId, setProductId] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('planning')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [error, setError] = useState<string | null>(null)

function handleContinueToPricing() {
    setError(null)

    if (mode === 'existing' && !clientId) {
      setError('Please select a client.')
      return
    }
    if (mode === 'guest' && !guestName.trim()) {
      setError("Please enter the guest client's name.")
      return
    }
    if (!name.trim()) {
      setError('Please enter a project name.')
      return
    }
    if (!productId) {
      setError('Please select a product.')
      return
    }

    const params = new URLSearchParams()
    if (mode === 'existing') {
      params.set('clientId', clientId)
    } else {
      params.set('guestName', guestName.trim())
      if (guestEmail.trim()) params.set('guestEmail', guestEmail.trim())
      if (guestPhone.trim()) params.set('guestPhone', guestPhone.trim())
    }
    params.set('name', name.trim())
    params.set('status', status)
    if (startDate) params.set('start_date', startDate)
    if (targetDate) params.set('target_completion_date', targetDate)

    router.push(`/admin/projects/new/${productId}?${params.toString()}`)
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
          name="client_id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required={!attachPricing}
          className="w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.full_name || client.email}</option>
          ))}
        </select>
      ) : (
        <div className="space-y-3 rounded border bg-gray-50 p-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Full Name</label>
            <input type="text" name="guest_name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required={!attachPricing} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Email (optional, enables auto-linking later)</label>
            <input type="email" name="guest_email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Phone</label>
            <input type="tel" name="guest_phone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Project Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded border border-gray-300 p-2" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="attachPricing" checked={attachPricing} onChange={(e) => setAttachPricing(e.target.checked)} />
        <label htmlFor="attachPricing" className="text-sm text-gray-700">
          Attach structured pricing from a product (like building a quote)
        </label>
      </div>

      {attachPricing ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Completion</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
            </div>
          </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleContinueToPricing}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Continue to Pricing
          </button>
        </>
      ) : (
        <form action={createProject} className="space-y-4">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="guest_name" value={guestName} />
          <input type="hidden" name="guest_email" value={guestEmail} />
          <input type="hidden" name="guest_phone" value={guestPhone} />
          <input type="hidden" name="name" value={name} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue="planning" className="mt-1 w-full rounded border border-gray-300 p-2">
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" name="start_date" className="mt-1 w-full rounded border border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Completion</label>
              <input type="date" name="target_completion_date" className="mt-1 w-full rounded border border-gray-300 p-2" />
            </div>
          </div>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Assign Project
          </button>
        </form>
      )}
    </div>
  )
}