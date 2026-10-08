type QuoteLineItem = { label: string; price: number; recurring?: boolean }
type QuoteHourlyItem = { label: string; rate: number; unit: string }

export type InvoiceCycle = 'once_off' | 'monthly' | 'hourly'
export type InvoiceItem = {
  label: string
  price: number
  cycle: InvoiceCycle
  rate?: number
}

export function buildInvoiceItems(
  lineItems: QuoteLineItem[],
  hourlyItems: QuoteHourlyItem[],
  fallbackLabel: string
) {
  const items: InvoiceItem[] = []

  for (const item of lineItems) {
    items.push({
      label: item.label,
      price: item.price,
      cycle: item.recurring ? 'monthly' : 'once_off',
    })
  }

  for (const item of hourlyItems) {
    items.push({
      label: `${item.label} (${item.unit})`,
      price: 0,
      cycle: 'hourly',
      rate: item.rate,
    })
  }

  if (items.length === 0) {
    items.push({ label: fallbackLabel, price: 0, cycle: 'once_off' })
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return { items, total }
}

export function summarizeInvoice(items: { price: number; cycle?: InvoiceCycle }[]) {
  let onceOff = 0
  let monthly = 0
  let hourly = 0

  for (const item of items) {
    const cycle = item.cycle || 'once_off'
    if (cycle === 'monthly') monthly += item.price
    else if (cycle === 'hourly') hourly += item.price
    else onceOff += item.price
  }

  return { onceOff, monthly, hourly, total: onceOff + monthly + hourly }
}