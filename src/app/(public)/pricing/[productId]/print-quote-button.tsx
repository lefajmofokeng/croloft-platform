'use client'

import { useState, useEffect } from 'react'
import { saveQuote, getCurrentClientProfile, loginForQuote } from '../actions'

type LineItem = { label: string; price: number; recurring?: boolean }

export default function PrintQuoteButton({
  productId,
  productName,
  lineItems,
  onceOffTotal,
  monthlyTotal,
}: {
  productId: string
  productName: string
  lineItems: LineItem[]
  onceOffTotal: number
  monthlyTotal: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'guest' | 'login'>('guest')

  // guest fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // detected logged-in client
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
    const dateStr = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const itemsHtml = lineItems
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">
            R${item.price.toFixed(2)}${item.recurring ? '/mo' : ''}
          </td>
        </tr>`
      )
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote ${quoteRef}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-placeholder { width: 160px; height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            .meta { text-align: right; font-size: 13px; color: #555; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 12px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 6px; }
            .client-info { margin-top: 16px; font-size: 13px; color: #444; }
            .footer { margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">CROLOFT LOGO</div>
            <div class="meta">
              <div><strong>Quote Ref:</strong> ${quoteRef}</div>
              <div><strong>Date:</strong> ${dateStr}</div>
            </div>
          </div>

          <h1>${productName}</h1>
          <p style="color:#666;font-size:13px;">Estimate prepared by Croloft Technologies</p>

          <div class="client-info">
            <div><strong>Prepared for:</strong> ${clientName}</div>
            <div>${clientEmail}</div>
          </div>

          <table>
            ${itemsHtml}
          </table>

          <div class="totals">
            <div><span>Once-off total</span><span>R${onceOffTotal.toFixed(2)}</span></div>
            ${monthlyTotal > 0 ? `<div><span>Monthly total</span><span>R${monthlyTotal.toFixed(2)}/mo</span></div>` : ''}
            <div class="grand"><span>Combined (Year 1)</span><span>R${(onceOffTotal + monthlyTotal * 12).toFixed(2)}</span></div>
          </div>

          <div class="footer">
            This is an estimate only and does not constitute a binding invoice. Prices are subject to change.
            Quote your reference number above if you contact us about this estimate.
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

  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await saveQuote({
      productId,
      productName,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      lineItems,
      onceOffTotal,
      monthlyTotal,
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
      productId,
      productName,
      clientName,
      clientEmail,
      clientPhone: '',
      lineItems,
      onceOffTotal,
      monthlyTotal,
      userId: result.userId,
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
      productId,
      productName,
      clientName,
      clientEmail,
      clientPhone: '',
      lineItems,
      onceOffTotal,
      monthlyTotal,
      userId: loggedInProfile.userId,
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
              // Already logged in — one click, no form needed
              <>
                <h2 className="mb-1 text-lg font-semibold">Generate Quote</h2>
                <p className="mb-4 text-sm text-gray-500">
                  Logged in as <strong>{loggedInProfile.fullName || loggedInProfile.email}</strong>.
                  This quote will be saved to your Croloft portal.
                </p>
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded border border-gray-300 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateAsLoggedIn}
                    disabled={loading}
                    className="flex-1 rounded bg-blue-600 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Quote'}
                  </button>
                </div>
              </>
            ) : mode === 'guest' ? (
              <>
                <h2 className="mb-1 text-lg font-semibold">Your Details</h2>
                <p className="mb-4 text-sm text-gray-500">
                  We&apos;ll use this to keep a record of your quote in case you contact us about it.
                </p>

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
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded border border-gray-300 py-2 text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 rounded bg-blue-600 py-2 text-sm text-white disabled:opacity-50">
                      {loading ? 'Generating...' : 'Generate Quote'}
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => { setMode('login'); setError(null) }}
                  className="mt-3 w-full text-center text-sm text-blue-600 hover:underline"
                >
                  I&apos;m already a client — log in to link this quote
                </button>
              </>
            ) : (
              <>
                <h2 className="mb-1 text-lg font-semibold">Log In</h2>
                <p className="mb-4 text-sm text-gray-500">
                  Log in to link this quote to your Croloft portal account.
                </p>

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
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded border border-gray-300 py-2 text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 rounded bg-blue-600 py-2 text-sm text-white disabled:opacity-50">
                      {loading ? 'Logging in...' : 'Log In & Generate'}
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => { setMode('guest'); setError(null) }}
                  className="mt-3 w-full text-center text-sm text-gray-500 hover:underline"
                >
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