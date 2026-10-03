'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateInvoiceDetails } from './actions'

type LineItem = { label: string; price: number }

export default function InvoiceLineItemsEditor({
  invoiceId,
  initialTitle,
  initialDueDate,
  initialLineItems,
}: {
  invoiceId: string
  initialTitle: string
  initialDueDate: string | null
  initialLineItems: LineItem[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [dueDate, setDueDate] = useState(initialDueDate || '')
  const [items, setItems] = useState<LineItem[]>(initialLineItems)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0)

  function updateItem(index: number, field: 'label' | 'price', value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value } : item
      )
    )
  }

  function addRow() {
    setItems((prev) => [...prev, { label: '', price: 0 }])
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const cleanedItems = items.filter((item) => item.label.trim().length > 0)

    const result = await updateInvoiceDetails({
      invoiceId,
      title,
      dueDate,
      lineItems: cleanedItems,
    })

    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.refresh()
  }

  return (
    <div className="mb-6 space-y-3 rounded border p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Line Items</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(i, 'label', e.target.value)}
                placeholder="Description"
                className="flex-1 rounded border border-gray-300 p-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(i, 'price', e.target.value)}
                placeholder="R Amount"
                className="w-32 rounded border border-gray-300 p-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="rounded border border-red-300 px-3 text-sm text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Add line item
        </button>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="font-semibold">Total: R{total.toFixed(2)}</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}