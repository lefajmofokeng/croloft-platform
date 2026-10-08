'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateInvoiceDetails } from './actions'

type Cycle = 'once_off' | 'monthly' | 'hourly'
type LineItem = { label: string; price: number; cycle?: Cycle; rate?: number }
type Row = { label: string; price: number; cycle: Cycle; rate: number }

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
  const [items, setItems] = useState<Row[]>(
    initialLineItems.map((item) => ({
      label: item.label,
      price: item.price,
      cycle: item.cycle || 'once_off',
      rate: item.rate || 0,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0)

  function updateItem(index: number, field: keyof Row, value: string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        if (field === 'price' || field === 'rate') {
          return { ...item, [field]: parseFloat(value) || 0 }
        }
        return { ...item, [field]: value }
      })
    )
  }

  function addRow() {
    setItems((prev) => [...prev, { label: '', price: 0, cycle: 'once_off', rate: 0 }])
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const cleanedItems = items
      .filter((item) => item.label.trim().length > 0)
      .map((item) => ({
        label: item.label.trim(),
        price: item.price,
        cycle: item.cycle,
        ...(item.cycle === 'hourly' ? { rate: item.rate } : {}),
      }))

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

        <div className="mb-1 grid grid-cols-12 gap-2 text-xs text-gray-400">
          <span className="col-span-4">Description</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Amount (R)</span>
          <span className="col-span-2">Rate (R/hr)</span>
          <span className="col-span-2"></span>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(i, 'label', e.target.value)}
                placeholder="Description"
                className="col-span-4 rounded border border-gray-300 p-2 text-sm"
              />
              <select
                value={item.cycle}
                onChange={(e) => updateItem(i, 'cycle', e.target.value)}
                className="col-span-2 rounded border border-gray-300 p-2 text-sm"
              >
                <option value="once_off">Once-off</option>
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(i, 'price', e.target.value)}
                className="col-span-2 rounded border border-gray-300 p-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={item.cycle === 'hourly' ? item.rate : ''}
                onChange={(e) => updateItem(i, 'rate', e.target.value)}
                disabled={item.cycle !== 'hourly'}
                placeholder={item.cycle === 'hourly' ? 'R/hr' : '—'}
                className="col-span-2 rounded border border-gray-300 p-2 text-sm disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="col-span-2 rounded border border-red-300 px-2 text-sm text-red-600 hover:bg-red-50"
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
        <p className="mt-2 text-xs text-gray-400">
          For hourly rows, the rate is the R/hr shown for reference and the amount is what you&apos;ve billed so far (R0 until you know the hours).
        </p>
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