export type MetricUnit = 'number' | 'currency' | 'percent'
export type MetricPreset = { name: string; unit: MetricUnit; lowerIsBetter?: boolean }

export const METRIC_GROUPS: { label: string; metrics: MetricPreset[] }[] = [
  {
    label: 'E-commerce / website',
    metrics: [
      { name: 'Website visitors', unit: 'number' },
      { name: 'Page views', unit: 'number' },
      { name: 'Orders', unit: 'number' },
      { name: 'Revenue', unit: 'currency' },
      { name: 'Conversion rate', unit: 'percent' },
      { name: 'Average order value', unit: 'currency' },
      { name: 'Cart abandonment rate', unit: 'percent', lowerIsBetter: true },
    ],
  },
  {
    label: 'Advertising',
    metrics: [
      { name: 'Impressions', unit: 'number' },
      { name: 'Clicks', unit: 'number' },
      { name: 'Click-through rate', unit: 'percent' },
      { name: 'Leads', unit: 'number' },
      { name: 'Cost per lead', unit: 'currency', lowerIsBetter: true },
      { name: 'Ad spend', unit: 'currency' },
      { name: 'Return on ad spend', unit: 'number' },
    ],
  },
  {
    label: 'AI / automation',
    metrics: [
      { name: 'Conversations handled', unit: 'number' },
      { name: 'Resolution rate', unit: 'percent' },
      { name: 'Average response time (seconds)', unit: 'number', lowerIsBetter: true },
      { name: 'Customer satisfaction', unit: 'percent' },
      { name: 'Hours saved', unit: 'number' },
    ],
  },
]

export function findMetricPreset(name: string): MetricPreset | undefined {
  for (const group of METRIC_GROUPS) {
    const found = group.metrics.find((m) => m.name === name)
    if (found) return found
  }
  return undefined
}