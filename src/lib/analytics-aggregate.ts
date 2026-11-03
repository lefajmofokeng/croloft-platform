type Event = { path: string; visitor_id: string; visited_at: string }

function startOf(period: 'day' | 'week' | 'month' | 'year', from = new Date()) {
  const d = new Date(from)
  if (period === 'day') {
    d.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    const day = d.getDay()
    const diff = day === 0 ? 6 : day - 1 // Monday as the start of the week
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  } else {
    d.setMonth(0, 1)
    d.setHours(0, 0, 0, 0)
  }
  return d
}

function countSince(events: Event[], since: Date) {
  const inRange = events.filter((e) => new Date(e.visited_at) >= since)
  return {
    views: inRange.length,
    visitors: new Set(inRange.map((e) => e.visitor_id)).size,
  }
}

export function aggregateAnalytics(events: Event[]) {
  const now = new Date()

  const today = countSince(events, startOf('day', now))
  const week = countSince(events, startOf('week', now))
  const month = countSince(events, startOf('month', now))
  const year = countSince(events, startOf('year', now))

  // Daily view count for the last 30 days, for the chart
  const dailyChart: { date: string; value: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i)
    const dayStart = startOf('day', day)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const count = events.filter((e) => {
      const t = new Date(e.visited_at)
      return t >= dayStart && t < dayEnd
    }).length

    dailyChart.push({ date: dayStart.toISOString().slice(0, 10), value: count })
  }

  // Top pages over the last 30 days
  const last30 = events.filter((e) => new Date(e.visited_at) >= startOf('day', new Date(now.getTime() - 29 * 86400000)))
  const pageCounts = new Map<string, number>()
  for (const e of last30) {
    pageCounts.set(e.path, (pageCounts.get(e.path) || 0) + 1)
  }
  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }))

  return { today, week, month, year, dailyChart, topPages }
}