'use client'

import { useState, useEffect } from 'react'
import { saveQuote, getCurrentClientProfile, loginForQuote } from '../actions'

type LineItem = { label: string; price: number; recurring?: boolean }
type HourlyItem = { label: string; rate: number; unit: string }

export default function PrintQuoteButton({
  productId,
  productName,
  lineItems,
  hourlyItems,
  onceOffTotal,
  monthlyTotal,
}: {
  productId: string
  productName: string
  lineItems: LineItem[]
  hourlyItems: HourlyItem[]
  onceOffTotal: number
  monthlyTotal: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'guest' | 'login'>('guest')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [loggedInProfile, setLoggedInProfile] = useState<{
    userId: string
    fullName: string | null
    email: string | null
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (showForm) {
      getCurrentClientProfile().then((profile) => {
        if (profile) setLoggedInProfile(profile)
      })
    }
  }, [showForm])

  function generatePdf(quoteRef: string, clientName: string, clientEmail: string) {
    const dateStr = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })

    const onceOffHtml = lineItems.filter((i) => !i.recurring).map((item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">R${item.price.toFixed(2)}</td>
        </tr>`).join('')

    const monthlyHtml = lineItems.filter((i) => i.recurring).map((item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">R${item.price.toFixed(2)}/mo</td>
        </tr>`).join('')

    const hourlyHtml = hourlyItems.map((item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.label} (${item.unit})</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">R${item.rate.toFixed(2)}/hr</td>
        </tr>`).join('')

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote ${quoteRef}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            .company-details { margin-top: 8px; font-size: 12px; color: #777; line-height: 1.5; }
            .meta { text-align: right; font-size: 13px; color: #555; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 20px 0 6px; }
            .parties { display: flex; justify-content: space-between; gap: 20px; margin: 20px 0; }
            .party { flex: 1; font-size: 13px; color: #444; }
            .party h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 12px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 6px; }
            .hourly-note { font-size: 11px; color: #999; margin-top: 4px; }
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
              <div><strong>Quote Ref:</strong> ${quoteRef}</div>
              <div><strong>Date:</strong> ${dateStr}</div>
            </div>
          </div>

          <h1>${productName}</h1>
          <p style="color:#666;font-size:13px;">Estimate prepared by Croloft Technologies</p>

          <div class="parties">
            <div class="party">
              <h3>Prepared For</h3>
              <div>${clientName}</div>
              <div>${clientEmail}</div>
            </div>
            <div class="party">
              <h3>From</h3>
              <div>Croloft Technologies (Pty) Ltd</div>
              <div>accounts@croloft.com</div>
              <div>+27 00 000 0000</div>
            </div>
          </div>

          ${onceOffHtml ? `<h3>Once-off</h3><table>${onceOffHtml}</table>` : ''}
          ${monthlyHtml ? `<h3>Monthly</h3><table>${monthlyHtml}</table>` : ''}
          ${hourlyHtml ? `<h3>Hourly</h3><table>${hourlyHtml}</table><p class="hourly-note">Hourly items are billed as worked and are not included in the totals below.</p>` : ''}

          <div class="totals">
            <div><span>Once-off total</span><span>R${onceOffTotal.toFixed(2)}</span></div>
            ${monthlyTotal > 0 ? `<div><span>Monthly total</span><span>R${monthlyTotal.toFixed(2)}/mo</span></div>` : ''}
            <div class="grand"><span>Combined (Year 1)</span><span>R${(onceOffTotal + monthlyTotal * 12).toFixed(2)}</span></div>
          </div>

          <div class="notices">
            <h4>Validity</h4>
            <p>This estimate is valid for 30 days from the date of issue. Prices are subject to change thereafter.</p>
            <h4>Terms</h4>
            <p>This is an estimate only and does not constitute a binding invoice. A formal invoice will be issued upon acceptance and commencement of work. Please reference the quote number above in all correspondence.</p>
            <h4>Notes</h4>
            <p>Scope and pricing are based on the configuration selected at time of quoting. Changes to scope may affect final pricing.</p>
          </div>

          <div class="stamp">
            Electronically generated quote — no signature required<br/>
            Ref: ${quoteRef}
          </div>

          <div class="footer">Croloft Technologies — Thank you for considering us.</div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => { printWindow.print() }
    }
  }

  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await saveQuote({
      productId, productName, clientName: name, clientEmail: email, clientPhone: phone,
      lineItems, hourlyItems, onceOffTotal, monthlyTotal,
    })

    setLoading(false)

    if (result.error || !result.quoteRef) {
      setError(result.error || 'Something went wrong. Please try again.')
      return
    }

    generatePdf(result.quoteRef, name, email)
    setShowForm(false)
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await loginForQuote(loginEmail, loginPassword)

    if (result.error || !result.userId) {
      setLoading(false)
      setError(result.error || 'Login failed')
      return
    }

    const clientName = result.fullName || loginEmail
    const clientEmail = result.email || loginEmail

    const quoteResult = await saveQuote({
      productId, productName, clientName, clientEmail, clientPhone: '',
      lineItems, onceOffTotal, hourlyItems, monthlyTotal, userId: result.userId,
    })

    setLoading(false)

    if (quoteResult.error || !quoteResult.quoteRef) {
      setError(quoteResult.error || 'Something went wrong. Please try again.')
      return
    }

    generatePdf(quoteResult.quoteRef, clientName, clientEmail)
    setShowForm(false)
  }

  async function handleGenerateAsLoggedIn() {
    if (!loggedInProfile) return
    setLoading(true)
    setError(null)

    const clientName = loggedInProfile.fullName || loggedInProfile.email || 'Client'
    const clientEmail = loggedInProfile.email || ''

    const result = await saveQuote({
      productId, productName, clientName, clientEmail, clientPhone: '',
      lineItems, onceOffTotal, hourlyItems, monthlyTotal, userId: loggedInProfile.userId,
    })

    setLoading(false)

    if (result.error || !result.quoteRef) {
      setError(result.error || 'Something went wrong. Please try again.')
      return
    }

    generatePdf(result.quoteRef, clientName, clientEmail)
    setShowForm(false)
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="mt-3 w-full rounded border border-blue-600 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
      >
        Print / Save Quote as PDF
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded bg-white p-6">
            {loggedInProfile ? (
              <>
                <h2 className="mb-1 text-lg font-semibold">Generate Quote</h2>
                <p className="mb-4 text-sm text-gray-500">
                  Logged in as <strong>{loggedInProfile.fullName || loggedInProfile.email}</strong>.
                  This quote will be saved to your Croloft portal.
                </p>
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 rounded border border-gray-300 py-2 text-sm">Cancel</button>
                  <button onClick={handleGenerateAsLoggedIn} disabled={loading} className="flex-1 rounded bg-blue-600 py-2 text-sm text-white disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate Quote'}
                  </button>
                </div>
              </>
            ) : mode === 'guest' ? (
              <>
                <h2 className="mb-1 text-lg font-semibold">Your Details</h2>
                <p className="mb-4 text-sm text-gray-500">We&apos;ll use this to keep a record of your quote in case you contact us about it.</p>
                <form onSubmit={handleGuestSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded border border-gray-300 py-2 text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 rounded bg-blue-600 py-2 text-sm text-white disabled:opacity-50">
                      {loading ? 'Generating...' : 'Generate Quote'}
                    </button>
                  </div>
                </form>
                <button onClick={() => { setMode('login'); setError(null) }} className="mt-3 w-full text-center text-sm text-blue-600 hover:underline">
                  I&apos;m already a client — log in to link this quote
                </button>
              </>
            ) : (
              <>
                <h2 className="mb-1 text-lg font-semibold">Log In</h2>
                <p className="mb-4 text-sm text-gray-500">Log in to link this quote to your Croloft portal account.</p>
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded border border-gray-300 py-2 text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 rounded bg-blue-600 py-2 text-sm text-white disabled:opacity-50">
                      {loading ? 'Logging in...' : 'Log In & Generate'}
                    </button>
                  </div>
                </form>
                <button onClick={() => { setMode('guest'); setError(null) }} className="mt-3 w-full text-center text-sm text-gray-500 hover:underline">
                  Back to guest quote
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}