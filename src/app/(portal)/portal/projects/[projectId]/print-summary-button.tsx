'use client'

type Update = { note: string; created_at: string }
type ChangelogEntry = { note: string; created_at: string }
type DocumentInfo = { name: string; description: string | null }

export default function PrintSummaryButton({
  projectName,
  projectNumber,
  status,
  progressPercent,
  description,
  startDate,
  targetDate,
  teamContactName,
  teamContactEmail,
  teamContactPhone,
  updates,
  changelog,
  documents,
}: {
  projectName: string
  projectNumber: string
  status: string
  progressPercent: number
  description: string | null
  startDate: string | null
  targetDate: string | null
  teamContactName: string | null
  teamContactEmail: string | null
  teamContactPhone: string | null
  updates: Update[]
  changelog: ChangelogEntry[]
  documents: DocumentInfo[]
}) {
  function handlePrint() {
    const updatesHtml = updates
      .map(
        (u) => `
        <div style="padding:10px 0;border-bottom:1px solid #eee;">
          <p style="margin:0;font-size:13px;">${u.note}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#999;">${new Date(u.created_at).toLocaleString('en-ZA')}</p>
        </div>`
      )
      .join('') || '<p style="font-size:13px;color:#999;">No timeline updates yet.</p>'

    const changelogHtml = changelog
      .map(
        (c) => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px;">
          <span>${c.note}</span>
          <span style="color:#999;font-size:11px;">${new Date(c.created_at).toLocaleDateString('en-ZA')}</span>
        </div>`
      )
      .join('') || '<p style="font-size:13px;color:#999;">No changelog entries yet.</p>'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${projectName} — Summary</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            .meta { text-align: right; font-size: 13px; color: #555; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            h2 { font-size: 15px; margin: 30px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
            .progress-bar { background: #eee; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 6px; }
            .progress-fill { background: #2563eb; height: 100%; }
            .status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">CROLOFT LOGO</div>
            <div class="meta">
              <div><strong>Project:</strong> ${projectNumber}</div>
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-ZA')}</div>
            </div>
          </div>

          <h1>${projectName}</h1>
          <span class="status">${status.replace('_', ' ')}</span>
          ${description ? `<p style="margin-top:12px;color:#555;">${description}</p>` : ''}

          <div style="margin-top:20px;">
            <p style="font-size:13px;color:#555;">Progress: ${progressPercent}%</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${progressPercent}%;"></div></div>
          </div>

          ${startDate || targetDate ? `
            <div style="margin-top:16px;font-size:13px;color:#555;">
              ${startDate ? `<span>Started: ${startDate}</span>` : ''}
              ${startDate && targetDate ? ' &nbsp;•&nbsp; ' : ''}
              ${targetDate ? `<span>Target: ${targetDate}</span>` : ''}
            </div>` : ''}

          ${teamContactName ? `
            <div style="margin-top:12px;font-size:13px;color:#555;">
              <strong>Project Lead:</strong> ${teamContactName}
              ${teamContactEmail ? `<br/>${teamContactEmail}` : ''}
              ${teamContactPhone ? `<br/>${teamContactPhone}` : ''}
            </div>` : ''}

          <h2>Timeline</h2>
          ${updatesHtml}

          <h2>Changelog</h2>
          ${changelogHtml}

          <h2>Documents</h2>
          <p style="font-size:13px;color:#555;margin-bottom:10px;">${documents.length} document(s) on file</p>
          ${documents.length > 0 ? documents.map((doc) => `
            <div style="padding:8px 0;border-bottom:1px solid #eee;">
              <p style="margin:0;font-size:13px;font-weight:bold;">${doc.name}</p>
              ${doc.description ? `<p style="margin:2px 0 0;font-size:12px;color:#777;">${doc.description}</p>` : ''}
            </div>
          `).join('') : '<p style="font-size:13px;color:#999;">No documents yet.</p>'}
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
      Download Project Summary (PDF)
    </button>
  )
}