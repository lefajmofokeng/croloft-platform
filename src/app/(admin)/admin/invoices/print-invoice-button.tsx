'use client'

import { summarizeInvoice } from '@/lib/invoice-items'

type LineItem = {
  label: string
  price: number
  cycle?: 'once_off' | 'monthly' | 'hourly'
  rate?: number
}

export default function AdminPrintInvoiceButton({
  invoiceNumber,
  title,
  lineItems,
  total,
  issueDate,
  dueDate,
  status,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
}: {
  invoiceNumber: string
  title: string
  lineItems: LineItem[]
  total: number
  issueDate: string
  dueDate: string | null
  status: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress?: string
}) {
  function handlePrint() {
    const money = (n: number) => `R${n.toFixed(2)}`
    const cell = 'padding:8px 6px;border-bottom:1px solid #eee;text-align:right;'
    const th = 'padding:6px;border-bottom:2px solid #333;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#888;text-align:right;'

    const itemsHtml = lineItems
      .map((item) => {
        const cycle = item.cycle || 'once_off'
        const onceOff = cycle === 'once_off' ? money(item.price) : '—'
        const monthly = cycle === 'monthly' ? money(item.price) : '—'
        let hourly = '—'
        if (cycle === 'hourly') {
          hourly =
            item.price > 0
              ? `${money(item.price)}<br/><span style="font-size:10px;color:#999;">${money(item.rate || 0)}/hr</span>`
              : `${money(item.rate || 0)}/hr`
        }
        return `
        <tr>
          <td style="padding:8px 6px 8px 0;border-bottom:1px solid #eee;">${item.label}</td>
          <td style="${cell}">${onceOff}</td>
          <td style="${cell}">${monthly}</td>
          <td style="${cell}">${hourly}</td>
        </tr>`
      })
      .join('')

    const sums = summarizeInvoice(lineItems)
    const hasMonthly = lineItems.some((i) => i.cycle === 'monthly')
    const hasHourly = lineItems.some((i) => i.cycle === 'hourly')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            .company-details { margin-top: 8px; font-size: 12px; color: #777; line-height: 1.5; }
            .meta { text-align: right; font-size: 13px; color: #555; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            .parties { display: flex; justify-content: space-between; gap: 20px; margin: 20px 0; }
            .party { flex: 1; font-size: 13px; color: #444; }
            .party h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 12px; display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #2563eb; }
            .status { display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 4px; font-size: 12px; text-transform: capitalize; background: #f3f4f6; color: #374151; }
            .notices { margin-top: 30px; font-size: 11px; color: #888; line-height: 1.6; border-top: 1px solid #eee; padding-top: 16px; }
            .notices h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 12px 0 4px; }
            .notices h4:first-child { margin-top: 0; }
            .stamp { margin-top: 24px; display: inline-block; border: 1.5px solid #2563eb; border-radius: 6px; padding: 10px 16px; font-size: 11px; color: #2563eb; }
            .footer { margin-top: 30px; font-size: 11px; color: #bbb; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-placeholder">CROLOFT LOGO</div>
              <div class="company-details">
                Croloft Technologies (Pty) Ltd<br/>
                Reg No: 2026/000000/07 (placeholder)<br/>
                123 Example Street, Durban, 4001<br/>
                accounts@croloft.com · +27 00 000 0000
              </div>
            </div>
            <div class="meta">
              <div><strong>Invoice:</strong> ${invoiceNumber}</div>
              <div><strong>Issued:</strong> ${issueDate}</div>
              ${dueDate ? `<div><strong>Due:</strong> ${dueDate}</div>` : ''}
              <span class="status">${status}</span>
            </div>
          </div>

          <h1>${title}</h1>

          <div class="parties">
            <div class="party">
              <h3>Billed To</h3>
              <div>${clientName}</div>
              ${clientEmail ? `<div>${clientEmail}</div>` : ''}
              ${clientPhone ? `<div>${clientPhone}</div>` : ''}
              ${clientAddress ? `<div style="white-space:pre-line;">${clientAddress}</div>` : ''}
            </div>
            <div class="party">
              <h3>From</h3>
              <div>Croloft Technologies (Pty) Ltd</div>
              <div>accounts@croloft.com</div>
              <div>+27 00 000 0000</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="${th}text-align:left;padding-left:0;">Description</th>
                <th style="${th}">Once-off</th>
                <th style="${th}">Monthly</th>
                <th style="${th}">Hourly</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td style="padding:10px 6px 4px 0;font-weight:bold;">Subtotals</td>
                <td style="padding:10px 6px 4px;text-align:right;font-weight:bold;">${money(sums.onceOff)}</td>
                <td style="padding:10px 6px 4px;text-align:right;font-weight:bold;">${money(sums.monthly)}</td>
                <td style="padding:10px 6px 4px;text-align:right;font-weight:bold;">${sums.hourly > 0 ? money(sums.hourly) : 'as worked'}</td>
              </tr>
            </tfoot>
          </table>
          ${hasMonthly || hasHourly ? `<p style="font-size:11px;color:#999;margin-top:6px;">Monthly amounts are for the first month. Hourly items are billed as worked.</p>` : ''}

          <div class="totals">
            <span>Total</span>
            <span>R${total.toFixed(2)}</span>
          </div>

          <div class="notices">
            <h4>Payment Terms</h4>
            <p>Payment is due within 14 days of the invoice date unless otherwise agreed in writing. Late payments may incur a 2% monthly surcharge.</p>
            <h4>Banking Details</h4>
            <p>Bank: [Bank Name] · Account Name: Croloft Technologies (Pty) Ltd · Account No: [0000000000] · Branch Code: [000000] (placeholder — update with real details)</p>
            <h4>Notes</h4>
            <p>This invoice reflects the agreed scope at time of issue. Additional work outside this scope will be invoiced separately. Please reference the invoice number above in all correspondence and payment references.</p>
          </div>

          <div class="stamp">
            Electronically generated invoice — no signature required<br/>
            Ref: ${invoiceNumber}
          </div>

          <div class="footer">Croloft Technologies — Thank you for your business.</div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  return (
    <button
      onClick={handlePrint}
      className="rounded border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
    >
      Print / Save as PDF
    </button>
  )
}