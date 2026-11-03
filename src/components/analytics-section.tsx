import MetricChart from './metric-chart'
import { aggregateAnalytics } from '@/lib/analytics-aggregate'

type Event = { path: string; visitor_id: string; visited_at: string }

export default function AnalyticsSection({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-500">No visits recorded yet.</p>
  }

  const { today, week, month, year, dailyChart, topPages } = aggregateAnalytics(events)
  const cards = [
    { label: 'Today', data: today },
    { label: 'This Week', data: week },
    { label: 'This Month', data: month },
    { label: 'This Year', data: year },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded border p-3">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-xl font-semibold">{c.data.views}</p>
            <p className="text-xs text-gray-400">page views</p>
            <p className="mt-1 text-sm text-gray-600">{c.data.visitors} visitors</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded border p-3">
        <p className="mb-2 text-sm text-gray-500">Page views, last 30 days</p>
        <MetricChart points={dailyChart} format={(n) => `${n}`} />
      </div>

      {topPages.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-500">Top pages, last 30 days</p>
          <div className="space-y-1 text-sm">
            {topPages.map((p) => (
              <div key={p.path} className="flex justify-between rounded border px-3 py-1.5">
                <span className="truncate">{p.path}</span>
                <span className="text-gray-500">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}