import MetricChart from './metric-chart'
import { findMetricPreset } from '@/lib/metric-presets'

type Row = {
  id: string
  metric_name: string
  unit: 'number' | 'currency' | 'percent'
  period_date: string
  value: number | string
}

function formatValue(n: number, unit: string) {
  if (unit === 'currency') {
    return `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }
  if (unit === 'percent') {
    return `${n.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}%`
  }
  return n.toLocaleString('en-ZA', { maximumFractionDigits: 2 })
}

export default function MetricsSection({ metrics }: { metrics: Row[] }) {
  if (metrics.length === 0) {
    return <p className="text-sm text-gray-500">No performance figures have been added yet.</p>
  }

  const groups = new Map<string, Row[]>()
  for (const row of metrics) {
    const list = groups.get(row.metric_name) || []
    list.push(row)
    groups.set(row.metric_name, list)
  }

  const names = Array.from(groups.keys()).sort()

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {names.map((name) => {
        const rows = (groups.get(name) || []).sort((a, b) => a.period_date.localeCompare(b.period_date))
        const unit = rows[0].unit
        const points = rows.map((r) => ({ date: r.period_date, value: Number(r.value) }))
        const latest = points[points.length - 1]
        const previous = points.length > 1 ? points[points.length - 2] : null
        const preset = findMetricPreset(name)

        let changeText = ''
        let changeClass = 'text-gray-500'
        let arrow = ''

        if (previous) {
          const diff = latest.value - previous.value
          arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '–'

          if (unit === 'percent') {
            changeText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pts`
          } else if (previous.value === 0) {
            changeText = `${diff > 0 ? '+' : diff < 0 ? '-' : ''}${formatValue(Math.abs(diff), unit)}`
          } else {
            const pct = (diff / Math.abs(previous.value)) * 100
            changeText = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
          }

          if (diff !== 0 && preset) {
            const good = preset.lowerIsBetter ? diff < 0 : diff > 0
            changeClass = good ? 'text-green-600' : 'text-red-600'
          }
        }

        return (
          <div key={name} className="rounded border p-3">
            <p className="text-sm text-gray-500">{name}</p>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold">{formatValue(latest.value, unit)}</p>
              {previous && (
                <p className={`text-sm ${changeClass}`}>
                  {arrow} {changeText}
                </p>
              )}
            </div>
            <p className="mb-2 text-xs text-gray-400">as of {latest.date}</p>
            <MetricChart points={points} format={(n) => formatValue(n, unit)} />
          </div>
        )
      })}
    </div>
  )
}