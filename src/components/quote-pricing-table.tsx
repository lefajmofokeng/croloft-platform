type LineItem = { label: string; price: number; recurring?: boolean }
type HourlyItem = { label: string; rate: number; unit: string }

const money = (n: number) => `R${Number(n).toFixed(2)}`

export default function QuotePricingTable({
  lineItems,
  hourlyItems,
  onceOffTotal,
  monthlyTotal,
}: {
  lineItems: LineItem[]
  hourlyItems: HourlyItem[]
  onceOffTotal: number | string
  monthlyTotal: number | string
}) {
  const onceOffRows = lineItems.filter((i) => !i.recurring)
  const monthlyRows = lineItems.filter((i) => i.recurring)
  const onceOffSum = Number(onceOffTotal)
  const monthlySum = Number(monthlyTotal)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Once-off</th>
              <th className="pb-2 text-right font-medium">Monthly</th>
              <th className="pb-2 text-right font-medium">Hourly</th>
            </tr>
          </thead>
          <tbody>
            {onceOffRows.map((item, i) => (
              <tr key={`o${i}`} className="border-b text-gray-600">
                <td className="py-2 pr-2">{item.label}</td>
                <td className="py-2 text-right">{money(item.price)}</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">—</td>
              </tr>
            ))}
            {monthlyRows.map((item, i) => (
              <tr key={`m${i}`} className="border-b text-gray-600">
                <td className="py-2 pr-2">{item.label}</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">{money(item.price)}</td>
                <td className="py-2 text-right">—</td>
              </tr>
            ))}
            {hourlyItems.map((item, i) => (
              <tr key={`h${i}`} className="border-b text-gray-600">
                <td className="py-2 pr-2">{item.label} ({item.unit})</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">{money(item.rate)}/hr</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-3">Totals</td>
              <td className="pt-3 text-right">{money(onceOffSum)}</td>
              <td className="pt-3 text-right">{money(monthlySum)}</td>
              <td className="pt-3 text-right">{hourlyItems.length > 0 ? 'as worked' : '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {monthlySum > 0 && (
        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Combined (Year 1)</span>
          <span>{money(onceOffSum + monthlySum * 12)}</span>
        </div>
      )}

      {(monthlyRows.length > 0 || hourlyItems.length > 0) && (
        <p className="mt-2 text-xs text-gray-400">
          Combined (Year 1) is the once-off total plus 12 months of monthly charges. Hourly items are billed as worked and not included.
        </p>
      )}
    </div>
  )
}