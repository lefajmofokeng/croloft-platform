'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { adminCreateQuote } from '../../actions'

type AddonOption = { id: string; label: string; price: number; is_default: boolean }
type Addon = {
  id: string
  name: string
  type: 'included' | 'dropdown' | 'numeric'
  billing_cycle: 'once_off' | 'monthly' | 'hourly'
  unit_price: number | null
  unit_label: string | null
  included_quantity: number
  group_name: string | null
  pricing_addon_options: AddonOption[]
}
type Product = {
  id: string
  name: string
  description: string | null
  pricing_addons: Addon[]
}

function groupAddons(addons: Addon[]) {
  const order: string[] = []
  const groups: Record<string, Addon[]> = {}
  for (const addon of addons) {
    const key = addon.group_name?.trim() || '__ungrouped__'
    if (!groups[key]) { groups[key] = []; order.push(key) }
    groups[key].push(addon)
  }
  return order.map((key) => ({ name: key === '__ungrouped__' ? null : key, addons: groups[key] }))
}

export default function AdminQuoteCalculator({
  product,
  clientId,
  guestName,
  guestEmail,
  guestPhone,
}: {
  product: Product
  clientId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
}) {
  const router = useRouter()

  const [dropdownSelections, setDropdownSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const addon of product.pricing_addons) {
      if (addon.type === 'dropdown') {
        const defaultOption = addon.pricing_addon_options.find((o) => o.is_default)
        if (defaultOption) initial[addon.id] = defaultOption.id
      }
    }
    return initial
  })

  const [numericQuantities, setNumericQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    for (const addon of product.pricing_addons) {
      if (addon.type === 'numeric') initial[addon.id] = addon.included_quantity
    }
    return initial
  })

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { onceOffTotal, monthlyTotal, hourlyItems, lineItems } = useMemo(() => {
    const items: { label: string; price: number; recurring?: boolean }[] = []
    const hourly: { label: string; rate: number; unit: string }[] = []

    for (const addon of product.pricing_addons) {
      const cycle = addon.billing_cycle

      if (addon.type === 'included') {
        if (cycle === 'hourly') {
          hourly.push({ label: addon.name, rate: Number(addon.unit_price || 0), unit: addon.unit_label || 'hour' })
        } else {
          items.push({ label: addon.name, price: Number(addon.unit_price || 0), recurring: cycle === 'monthly' })
        }
      } else if (addon.type === 'dropdown') {
        const option = addon.pricing_addon_options.find((o) => o.id === dropdownSelections[addon.id])
        if (option) {
          if (cycle === 'hourly') {
            hourly.push({ label: `${addon.name}: ${option.label}`, rate: Number(option.price), unit: addon.unit_label || 'hour' })
          } else {
            items.push({ label: `${addon.name}: ${option.label}`, price: Number(option.price), recurring: cycle === 'monthly' })
          }
        }
      } else if (addon.type === 'numeric') {
        const qty = numericQuantities[addon.id] ?? addon.included_quantity
        const extraUnits = Math.max(0, qty - addon.included_quantity)
        if (cycle === 'hourly') {
          if (qty > 0) hourly.push({ label: addon.name, rate: Number(addon.unit_price || 0) * qty, unit: `${qty} ${addon.unit_label || 'hour'}(s)` })
        } else if (extraUnits > 0) {
          items.push({
            label: `${addon.name} (${extraUnits} extra ${addon.unit_label}(s))`,
            price: extraUnits * Number(addon.unit_price || 0),
            recurring: cycle === 'monthly',
          })
        }
      }
    }

    const onceOff = items.filter((i) => !i.recurring).reduce((sum, i) => sum + i.price, 0)
    const monthly = items.filter((i) => i.recurring).reduce((sum, i) => sum + i.price, 0)
    return { onceOffTotal: onceOff, monthlyTotal: monthly, hourlyItems: hourly, lineItems: items }
  }, [product, dropdownSelections, numericQuantities])

  const groupedAddons = groupAddons(product.pricing_addons)

  async function handleGenerate() {
    setGenerating(true)
    setError(null)

        const result = await adminCreateQuote({
      clientId,
      guestName,
      guestEmail,
      guestPhone,
      productId: product.id,
      productName: product.name,
      lineItems,
      hourlyItems,
      onceOffTotal,
      monthlyTotal,
    })

    setGenerating(false)

    if (result.error || !result.quoteRef) {
      setError(result.error || 'Something went wrong')
      return
    }

    router.push('/admin/quotes')
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-1 text-3xl font-bold">{product.name}</h1>
      {product.description && <p className="mb-6 text-gray-500">{product.description}</p>}

      <div className="space-y-6">
        {groupedAddons.map((group, gi) => (
          <div key={gi}>
            {group.name && <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">{group.name}</h2>}
            <div className="space-y-4">
              {group.addons.map((addon) => {
                if (addon.type === 'included') {
                  return (
                    <div key={addon.id} className="flex items-center justify-between rounded border bg-gray-50 p-4">
                      <span className="font-medium">{addon.name}</span>
                      <span className="text-xs text-gray-400">Included</span>
                    </div>
                  )
                }
                if (addon.type === 'dropdown') {
                  return (
                    <div key={addon.id} className="rounded border p-4">
                      <label className="mb-2 block font-medium">{addon.name}</label>
                      <select
                        className="w-full rounded border border-gray-300 p-2"
                        value={dropdownSelections[addon.id] || ''}
                        onChange={(e) => setDropdownSelections((prev) => ({ ...prev, [addon.id]: e.target.value }))}
                      >
                        <option value="">None</option>
                        {addon.pricing_addon_options.map((option) => (
                          <option key={option.id} value={option.id}>{option.label} (R{option.price})</option>
                        ))}
                      </select>
                    </div>
                  )
                }
                return (
                  <div key={addon.id} className="rounded border p-4">
                    <label className="mb-2 block font-medium">{addon.name}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={addon.included_quantity}
                        className="w-24 rounded border border-gray-300 p-2"
                        value={numericQuantities[addon.id] ?? addon.included_quantity}
                        onChange={(e) => setNumericQuantities((prev) => ({
                          ...prev,
                          [addon.id]: Math.max(addon.included_quantity, parseInt(e.target.value) || addon.included_quantity),
                        }))}
                      />
                      <span className="text-sm text-gray-500">{addon.unit_label}(s) — R{addon.unit_price} each</span>
                    </div>
                    {addon.included_quantity > 0 && (
                      <p className="mt-1 text-xs text-gray-400">{addon.included_quantity} included — additional billed extra</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-8 rounded border bg-white p-4 shadow-lg">
        <div className="mb-3 space-y-3 border-b pb-3">
          {lineItems.some((i) => !i.recurring) && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Once-off</p>
              {lineItems.filter((i) => !i.recurring).map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600">
                  <span>{item.label}</span><span>R{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          {lineItems.some((i) => i.recurring) && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Monthly</p>
              {lineItems.filter((i) => i.recurring).map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600">
                  <span>{item.label}</span><span>R{item.price.toFixed(2)}/mo</span>
                </div>
              ))}
            </div>
          )}
          {hourlyItems.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Hourly</p>
              {hourlyItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600">
                  <span>{item.label} ({item.unit})</span><span>R{item.rate.toFixed(2)}/hr</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Once-off total</span>
            <span className="font-semibold">R{onceOffTotal.toFixed(2)}</span>
          </div>
          {monthlyTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly total</span>
              <span className="font-semibold">R{monthlyTotal.toFixed(2)}/mo</span>
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-3 w-full rounded bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {generating ? 'Creating...' : 'Create Quote'}
        </button>
      </div>
    </div>
  )
}