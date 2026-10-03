'use client'

type LineItem = { label: string; price: number }

export default function PrintInvoiceButton({
  invoiceNumber,
  title,
  lineItems,
  total,
  issueDate,
  dueDate,
  status,
}: {
  invoiceNumber: string
  title: string
  lineItems: LineItem[]
  total: number
  issueDate: string
  dueDate: string | null
  status: string
}) {
  function handlePrint() {
    const itemsHtml = lineItems
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">
            R${item.price.toFixed(2)}
          </td>
        </tr>`
      )
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            .meta { text-align: right; font-size: 13px; color: #555; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 12px; display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #2563eb; }
            .status { display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 4px; font-size: 12px; text-transform: capitalize; background: #f3f4f6; color: #374151; }
            .footer { margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">CROLOFT LOGO</div>
            <div class="meta">
              <div><strong>Invoice:</strong> ${invoiceNumber}</div>
              <div><strong>Issued:</strong> ${issueDate}</div>
              ${dueDate ? `<div><strong>Due:</strong> ${dueDate}</div>` : ''}
            </div>
          </div>

          <h1>${title}</h1>
          <span class="status">${status}</span>

          <table>
            ${itemsHtml}
          </table>

          <div class="totals">
            <span>Total</span>
            <span>R${total.toFixed(2)}</span>
          </div>

          <div class="footer">
            Croloft Technologies. Please reference ${invoiceNumber} in any correspondence about this invoice.
          </div>
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
      className="mt-4 w-full rounded border border-blue-600 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
    >
      Print / Save as PDF
    </button>
  )
}