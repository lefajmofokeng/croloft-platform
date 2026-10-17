type Point = { date: string; value: number }

export default function MetricChart({
  points,
  format,
}: {
  points: Point[]
  format: (n: number) => string
}) {
  if (points.length === 0) return null

  const width = 300
  const height = 80
  const padX = 8
  const padY = 10

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const x = (i: number) =>
    points.length === 1 ? width / 2 : padX + (i * (width - padX * 2)) / (points.length - 1)
  const y = (v: number) =>
    max === min ? height / 2 : height - padY - ((v - min) / range) * (height - padY * 2)

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ')
  const area =
    points.length > 1
      ? `${line} L${x(points.length - 1).toFixed(1)},${height - padY} L${x(0).toFixed(1)},${height - padY} Z`
      : ''

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full" role="img" aria-label="Trend chart">
        {area && <path d={area} fill="#2563eb" opacity="0.08" />}
        {points.length > 1 && (
          <path d={line} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r="3.5" fill="#2563eb">
            <title>{`${p.date}: ${format(p.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{points[0].date}</span>
        {points.length > 1 && <span>{points[points.length - 1].date}</span>}
      </div>
    </div>
  )
}