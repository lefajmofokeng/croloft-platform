'use client'

import { useState, useMemo } from 'react'
import PrintQuoteButton from './print-quote-button'

type AddonOption = {
  id: string
  label: string
  price: number
  is_default: boolean
}

type Addon = {
  id: string
  name: string
  type: 'included' | 'dropdown' | 'numeric'
  billing_cycle: 'once_off' | 'monthly'
  unit_price: number | null
  unit_label: string | null
  included_quantity: number
  pricing_addon_options: AddonOption[]
}

type Product = {
  id: string
  name: string
  description: string | null
  pricing_addons: Addon[]
}

export default function PricingCalculator({ product }: { product: Product }) {
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
      if (addon.type === 'numeric') {
        initial[addon.id] = addon.included_quantity
      }
    }
    return initial
  })

  const { onceOffTotal, monthlyTotal, lineItems } = useMemo(() => {
    const items: { label: string; price: number; recurring?: boolean }[] = []

    for (const addon of product.pricing_addons) {
      const isMonthly = addon.billing_cycle === 'monthly'

      if (addon.type === 'included') {
        items.push({
          label: addon.name,
          price: Number(addon.unit_price || 0),
          recurring: isMonthly,
        })
      } else if (addon.type === 'dropdown') {
        const selectedOptionId = dropdownSelections[addon.id]
        const option = addon.pricing_addon_options.find((o) => o.id === selectedOptionId)
        if (option) {
          items.push({
            label: `${addon.name}: ${option.label}`,
            price: Number(option.price),
            recurring: isMonthly,
          })
        }
      } else if (addon.type === 'numeric') {
        const qty = numericQuantities[addon.id] ?? addon.included_quantity
        const extraUnits = Math.max(0, qty - addon.included_quantity)
        if (extraUnits > 0) {
          items.push({
            label: `${addon.name} (${extraUnits} extra ${addon.unit_label}(s))`,
            price: extraUnits * Number(addon.unit_price || 0),
            recurring: isMonthly,
          })
        }
      }
    }

    const onceOff = items.filter((i) => !i.recurring).reduce((sum, i) => sum + i.price, 0)
    const monthly = items.filter((i) => i.recurring).reduce((sum, i) => sum + i.price, 0)

    return { onceOffTotal: onceOff, monthlyTotal: monthly, lineItems: items }
  }, [product, dropdownSelections, numericQuantities])

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-1 text-3xl font-bold">{product.name}</h1>
      {product.description && <p className="mb-6 text-gray-500">{product.description}</p>}

      <div className="space-y-4">
        {product.pricing_addons.map((addon) => {
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
                  onChange={(e) =>
                    setDropdownSelections((prev) => ({ ...prev, [addon.id]: e.target.value }))
                  }
                >
                  <option value="">None</option>
                  {addon.pricing_addon_options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }

          // numeric
          return (
            <div key={addon.id} className="rounded border p-4">
              <label className="mb-2 block font-medium">{addon.name}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={addon.included_quantity}
                  className="w-24 rounded border border-gray-300 p-2"
                  value={numericQuantities[addon.id] ?? addon.included_quantity}
                  onChange={(e) =>
                    setNumericQuantities((prev) => ({
                      ...prev,
                      [addon.id]: Math.max(addon.included_quantity, parseInt(e.target.value) || addon.included_quantity),
                    }))
                  }
                />
                <span className="text-sm text-gray-500">{addon.unit_label}(s)</span>
              </div>
              {addon.included_quantity > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  {addon.included_quantity} included — additional {addon.unit_label}(s) billed extra
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="sticky bottom-4 mt-8 rounded border bg-white p-4 shadow-lg">
        <div className="mb-3 space-y-3 border-b pb-3">
          {lineItems.some((i) => !i.recurring) && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Once-off</p>
              <div className="space-y-1">
                {lineItems.filter((i) => !i.recurring).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600">
                    <span>{item.label}</span>
                    <span>R{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lineItems.some((i) => i.recurring) && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Monthly</p>
              <div className="space-y-1">
                {lineItems.filter((i) => i.recurring).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600">
                    <span>{item.label}</span>
                    <span>R{item.price.toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>
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
          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <span className="text-lg font-medium">Combined (Year 1)</span>
            <span className="text-2xl font-bold text-blue-600">
              R{(onceOffTotal + monthlyTotal * 12).toFixed(2)}
            </span>
          </div>
        </div>

        <PrintQuoteButton
          productId={product.id}
          productName={product.name}
          lineItems={lineItems}
          onceOffTotal={onceOffTotal}
          monthlyTotal={monthlyTotal}
        />
      </div>
    </div>
  )
}