'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-xl font-bold">Check your email</h1>
          <p className="text-sm text-gray-500">
            If an account exists for {email}, we&apos;ve sent a link to reset your password.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-gray-500">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">Back to login</a>
        </p>
      </form>
    </div>
  )
}