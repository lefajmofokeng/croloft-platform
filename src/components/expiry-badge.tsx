export default function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return null

  const daysLeft = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  let className = 'bg-green-100 text-green-700'
  let label = `Valid (${daysLeft} days)`

  if (daysLeft < 0) {
    className = 'bg-red-100 text-red-700'
    label = 'Expired'
  } else if (daysLeft <= 7) {
    className = 'bg-red-100 text-red-700'
    label = `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
  } else if (daysLeft <= 30) {
    className = 'bg-amber-100 text-amber-700'
    label = `Expires in ${daysLeft} days`
  }

  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}