'use client'

import { assetTypeLabel, assetStatusLabel } from '@/lib/asset-options'

type Asset = {
  name: string
  asset_type: string
  make: string | null
  model: string | null
  serial_number: string | null
  location: string | null
  warranty_expiry: string | null
  status: string
  projects: { name: string } | null
}

export default function PrintAssetsButton({ assets, clientName }: { assets: Asset[]; clientName: string }) {
  function handlePrint() {
    const rowsHtml = assets
      .map(
        (a) => `
        <tr>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${a.name}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${assetTypeLabel(a.asset_type)}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${[a.make, a.model].filter(Boolean).join(' ') || '—'}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${a.serial_number || '—'}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${a.location || '—'}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${a.warranty_expiry || '—'}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">${assetStatusLabel(a.status)}</td>
        </tr>`
      )
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Equipment List</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 900px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            h1 { font-size: 20px; margin: 0 0 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { text-align: left; padding: 6px; border-bottom: 2px solid #333; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; }
            .footer { margin-top: 30px; font-size: 11px; color: #bbb; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">CROLOFT LOGO</div>
            <div style="text-align:right;font-size:13px;color:#555;">
              <div><strong>Prepared for:</strong> ${clientName}</div>
              <div>${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
          <h1>Equipment List</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Type</th><th>Make/Model</th><th>Serial</th><th>Location</th><th>Warranty</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="footer">Croloft Technologies — keep this for your records.</div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=900,height=900')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => printWindow.print()
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