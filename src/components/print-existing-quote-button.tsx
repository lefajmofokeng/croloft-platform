'use client'

import { openQuotePdf } from '@/lib/quote-pdf'

type LineItem = { service?: string; description?: string; label: string; price: number; recurring?: boolean }
type HourlyItem = { service?: string; label: string; rate: number; unit: string }

export default function PrintExistingQuoteButton({
  quoteRef,
  productName,
  clientName,
  clientEmail,
  lineItems,
  hourlyItems,
  onceOffTotal,
  monthlyTotal,
}: {
  quoteRef: string
  productName: string
  clientName: string
  clientEmail: string
  lineItems: LineItem[]
  hourlyItems: HourlyItem[]
  onceOffTotal: number
  monthlyTotal: number
}) {
  return (
    <button
      onClick={() =>
        openQuotePdf({ quoteRef, productName, clientName, clientEmail, lineItems, hourlyItems, onceOffTotal, monthlyTotal })
      }
      className="rounded border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
    >
      Print / Save as PDF
    </button>
  )
}