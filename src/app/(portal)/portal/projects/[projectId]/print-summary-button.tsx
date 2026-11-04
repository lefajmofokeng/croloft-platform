'use client'

import { aggregateAnalytics } from '@/lib/analytics-aggregate'
import { assetTypeLabel } from '@/lib/asset-options'

type Update = { note: string; created_at: string }
type ChangelogEntry = { note: string; created_at: string }
type DocumentInfo = { name: string; description: string | null }
type MetricRow = { metric_name: string; unit: 'number' | 'currency' | 'percent'; period_date: string; value: number | string }
type AnalyticsEvent = { path: string; visitor_id: string; visited_at: string }
type RequestRow = { title: string; description: string; status: string; created_at: string }

function formatValue(n: number, unit: string) {
  if (unit === 'currency') return `R${n.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}`
  if (unit === 'percent') return `${n.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}%`
  return n.toLocaleString('en-ZA', { maximumFractionDigits: 2 })
}

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
  showTimeline,
  showChangelog,
  updates,
  changelog,
  documents,
  domainName,
  registrar,
  domainExpiry,
  sslProvider,
  sslExpiry,
  hostingProvider,
  dnsProvider,
  showDomainSsl,
  metrics,
  showMetrics,
  analyticsEvents,
  showAnalytics,
  requests,
  hasCredentials,
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
  showTimeline: boolean
  showChangelog: boolean
  updates: Update[]
  changelog: ChangelogEntry[]
  documents: DocumentInfo[]
  domainName?: string | null
  registrar?: string | null
  domainExpiry?: string | null
  sslProvider?: string | null
  sslExpiry?: string | null
  hostingProvider?: string | null
  dnsProvider?: string | null
  showDomainSsl?: boolean
  metrics?: MetricRow[]
  showMetrics?: boolean
  analyticsEvents?: AnalyticsEvent[]
  showAnalytics?: boolean
  requests?: RequestRow[]
  hasCredentials?: boolean
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

    const docsCountHtml = `<p style="font-size:13px;color:#555;margin-bottom:10px;">${documents.length} document(s) on file</p>`
    const docsHtml = documents.length > 0
      ? documents.map((doc) => `
          <div style="padding:8px 0;border-bottom:1px solid #eee;">
            <p style="margin:0;font-size:13px;font-weight:bold;">${doc.name}</p>
            ${doc.description ? `<p style="margin:2px 0 0;font-size:12px;color:#777;">${doc.description}</p>` : ''}
          </div>`).join('')
      : '<p style="font-size:13px;color:#999;">No documents yet.</p>'

    let domainSslHtml = ''
    if (showDomainSsl && (domainName || sslProvider || hostingProvider || dnsProvider)) {
      const rows = [
        domainName ? `<div><strong>Domain:</strong> ${domainName}</div>` : '',
        registrar ? `<div><strong>Registrar:</strong> ${registrar}</div>` : '',
        domainExpiry ? `<div><strong>Domain Expiry:</strong> ${domainExpiry}</div>` : '',
        sslProvider ? `<div><strong>SSL Provider:</strong> ${sslProvider}</div>` : '',
        sslExpiry ? `<div><strong>SSL Expiry:</strong> ${sslExpiry}</div>` : '',
        hostingProvider ? `<div><strong>Hosting:</strong> ${hostingProvider}</div>` : '',
        dnsProvider ? `<div><strong>DNS:</strong> ${dnsProvider}</div>` : '',
      ].filter(Boolean).join('')
      domainSslHtml = `
        <h2>Domain &amp; SSL</h2>
        <div style="font-size:13px;color:#555;line-height:1.8;">${rows}</div>`
    }

    let metricsHtml = ''
    if (showMetrics && metrics && metrics.length > 0) {
      const byName = new Map<string, MetricRow[]>()
      for (const row of metrics) {
        const list = byName.get(row.metric_name) || []
        list.push(row)
        byName.set(row.metric_name, list)
      }
      const rows = Array.from(byName.entries())
        .map(([name, points]) => {
          const sorted = [...points].sort((a, b) => a.period_date.localeCompare(b.period_date))
          const latest = sorted[sorted.length - 1]
          return `
            <tr>
              <td style="padding:6px;border-bottom:1px solid #eee;">${name}</td>
              <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatValue(Number(latest.value), latest.unit)}</td>
              <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;font-size:11px;color:#999;">as of ${latest.period_date}</td>
            </tr>`
        })
        .join('')
      metricsHtml = `
        <h2>Performance</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table>`
    }

    let analyticsHtml = ''
    if (showAnalytics && analyticsEvents && analyticsEvents.length > 0) {
      const { today, week, month, year } = aggregateAnalytics(analyticsEvents)
      const cards = [
        ['Today', today], ['This Week', week], ['This Month', month], ['This Year', year],
      ] as const
      const cardsHtml = cards
        .map(([label, d]) => `
          <td style="padding:8px;text-align:center;border:1px solid #eee;">
            <div style="font-size:11px;color:#999;">${label}</div>
            <div style="font-size:16px;font-weight:bold;">${d.views}</div>
            <div style="font-size:11px;color:#777;">views</div>
            <div style="font-size:11px;color:#777;">${d.visitors} visitors</div>
          </td>`)
        .join('')
      analyticsHtml = `
        <h2>Analytics</h2>
        <table style="width:100%;border-collapse:collapse;"><tr>${cardsHtml}</tr></table>`
    }

    let requestsHtml = ''
    if (requests && requests.length > 0) {
      const rows = requests
        .map((r) => `
          <tr>
            <td style="padding:6px;border-bottom:1px solid #eee;">${r.title}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;text-transform:capitalize;">${r.status.replace('_', ' ')}</td>
          </tr>`)
        .join('')
      requestsHtml = `
        <h2>Requests</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table>`
    }

    const credentialsHtml = hasCredentials
      ? `
        <h2>Access Credentials</h2>
        <p style="font-size:12px;color:#888;background:#f9fafb;border:1px solid #eee;border-radius:4px;padding:10px;">
          Login details for this project are stored securely in your Croloft portal and are not included in this document.
          To view or copy them, log in to your portal, open this project, and confirm your account password when prompted.
        </p>`
      : ''

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

          ${domainSslHtml}
          ${metricsHtml}
          ${analyticsHtml}
          ${requestsHtml}
          ${credentialsHtml}

          ${showTimeline ? `<h2>Timeline</h2>${updatesHtml}` : ''}
          ${showChangelog ? `<h2>Changelog</h2>${changelogHtml}` : ''}

          <h2>Documents</h2>
          ${docsCountHtml}
          ${docsHtml}
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => printWindow.print()
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