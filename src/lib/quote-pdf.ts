type LineItem = { service?: string; description?: string; label: string; price: number; recurring?: boolean }
type HourlyItem = { service?: string; label: string; rate: number; unit: string }

function serviceOf(item: { service?: string; label: string }) {
  return item.service || item.label
}
function descriptionOf(item: { service?: string; description?: string; label: string }) {
  if (item.description !== undefined) return item.description
  return item.service ? '' : item.label
}

export function openQuotePdf(args: {
  quoteRef: string
  productName: string
  clientName: string
  clientEmail: string
  lineItems: LineItem[]
  hourlyItems: HourlyItem[]
  onceOffTotal: number
  monthlyTotal: number
}) {
  const { quoteRef, productName, clientName, clientEmail, lineItems, hourlyItems, onceOffTotal, monthlyTotal } = args
  const dateStr = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })

  const money = (n: number) => `R${n.toFixed(2)}`
  const cell = 'padding:8px 6px;border-bottom:1px solid #eee;text-align:right;'
  const th = 'padding:6px;border-bottom:2px solid #333;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#888;text-align:right;'
  const labelCell = 'padding:8px 6px 8px 0;border-bottom:1px solid #eee;'
  const descCell = 'padding:8px 6px;border-bottom:1px solid #eee;color:#777;'

  const onceOffRows = lineItems.filter((i) => !i.recurring).map((item) => `
    <tr><td style="${labelCell}">${serviceOf(item)}</td><td style="${descCell}">${descriptionOf(item)}</td>
    <td style="${cell}">${money(item.price)}</td><td style="${cell}">—</td><td style="${cell}">—</td></tr>`)

  const monthlyRows = lineItems.filter((i) => i.recurring).map((item) => `
    <tr><td style="${labelCell}">${serviceOf(item)}</td><td style="${descCell}">${descriptionOf(item)}</td>
    <td style="${cell}">—</td><td style="${cell}">${money(item.price)}</td><td style="${cell}">—</td></tr>`)

  const hourlyRows = hourlyItems.map((item) => `
    <tr><td style="${labelCell}">${serviceOf(item)}</td><td style="${descCell}">${item.unit}</td>
    <td style="${cell}">—</td><td style="${cell}">—</td><td style="${cell}">${money(item.rate)}/hr</td></tr>`)

  const rowsHtml = [...onceOffRows, ...monthlyRows, ...hourlyRows].join('')
  const hasMonthly = lineItems.some((i) => i.recurring)
  const hasHourly = hourlyItems.length > 0

  const html = `
    <!DOCTYPE html><html><head><title>Quote ${quoteRef}</title><style>
      body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
      .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
      .company-details { margin-top: 8px; font-size: 12px; color: #777; line-height: 1.5; }
      .meta { text-align: right; font-size: 13px; color: #555; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      .parties { display: flex; justify-content: space-between; gap: 20px; margin: 20px 0; }
      .party { flex: 1; font-size: 13px; color: #444; }
      .party h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 0 0 6px; }
      table { width: 100%; border-collapse: collapse; }
      .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 12px; }
      .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
      .grand { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 6px; }
      .notices { margin-top: 30px; font-size: 11px; color: #888; line-height: 1.6; border-top: 1px solid #eee; padding-top: 16px; }
      .notices h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 12px 0 4px; }
      .notices h4:first-child { margin-top: 0; }
      .stamp { margin-top: 24px; display: inline-block; border: 1.5px solid #2563eb; border-radius: 6px; padding: 10px 16px; font-size: 11px; color: #2563eb; }
      .footer { margin-top: 30px; font-size: 11px; color: #bbb; text-align: center; }
    </style></head><body>
      <div class="header">
        <div><div class="logo-placeholder">CROLOFT LOGO</div>
          <div class="company-details">Croloft Technologies (Pty) Ltd<br/>Reg No: 2026/000000/07 (placeholder)<br/>123 Example Street, Durban, 4001<br/>accounts@croloft.com · +27 00 000 0000</div>
        </div>
        <div class="meta"><div><strong>Quote Ref:</strong> ${quoteRef}</div><div><strong>Date:</strong> ${dateStr}</div></div>
      </div>
      <h1>${productName}</h1>
      <p style="color:#666;font-size:13px;">Estimate prepared by Croloft Technologies</p>
      <div class="parties">
        <div class="party"><h3>Prepared For</h3><div>${clientName}</div><div>${clientEmail}</div></div>
        <div class="party"><h3>From</h3><div>Croloft Technologies (Pty) Ltd</div><div>accounts@croloft.com</div><div>+27 00 000 0000</div></div>
      </div>
      <table>
        <thead><tr>
          <th style="${th}text-align:left;padding-left:0;">Service</th><th style="${th}text-align:left;">Description</th>
          <th style="${th}">Once-off</th><th style="${th}">Monthly</th><th style="${th}">Hourly</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr>
          <td style="padding:10px 6px 4px 0;font-weight:bold;" colspan="2">Totals</td>
          <td style="padding:10px 6px 4px;text-align:right;font-weight:bold;">${money(onceOffTotal)}</td>
          <td style="padding:10px 6px 4px;text-align:right;font-weight:bold;">${money(monthlyTotal)}</td>
          <td style="padding:10px 6px 4px;text-align:right;font-weight:bold;">${hasHourly ? 'as worked' : '—'}</td>
        </tr></tfoot>
      </table>
      <div class="totals">
        <div><span>Once-off total</span><span>${money(onceOffTotal)}</span></div>
        ${monthlyTotal > 0 ? `<div><span>Monthly total</span><span>${money(monthlyTotal)}/mo</span></div>` : ''}
        <div class="grand"><span>Combined (Year 1)</span><span>${money(onceOffTotal + monthlyTotal * 12)}</span></div>
      </div>
      ${hasMonthly || hasHourly ? `<p style="font-size:11px;color:#999;margin-top:6px;">Combined (Year 1) is the once-off total plus 12 months of monthly charges. Hourly items are billed as worked and are not included.</p>` : ''}
      <div class="notices">
        <h4>Validity</h4><p>This estimate is valid for 30 days from the date of issue. Prices are subject to change thereafter.</p>
        <h4>Terms</h4><p>This is an estimate only and does not constitute a binding invoice. A formal invoice will be issued upon acceptance and commencement of work. Please reference the quote number above in all correspondence.</p>
        <h4>Notes</h4><p>Scope and pricing are based on the configuration selected at time of quoting. Changes to scope may affect final pricing.</p>
      </div>
      <div class="stamp">Electronically generated quote — no signature required<br/>Ref: ${quoteRef}</div>
      <div class="footer">Croloft Technologies — Thank you for considering us.</div>
    </body></html>`

  const printWindow = window.open('', '_blank', 'width=800,height=900')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => printWindow.print()
  }
}