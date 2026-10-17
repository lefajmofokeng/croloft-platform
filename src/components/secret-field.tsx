'use client'

import { useState, useEffect } from 'react'
import { getCredentialSecret, unlockCredentials } from '@/lib/credential-actions'

type Pending = 'reveal' | 'copy' | null

export default function SecretField({
  credentialId,
  field,
  label,
}: {
  credentialId: string
  field: 'password' | 'notes'
  label: string
}) {
  const [value, setValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Pending>(null)
  const [password, setPassword] = useState('')

  // Hide it again automatically after 30 seconds
  useEffect(() => {
    if (value === null) return
    const timer = setTimeout(() => setValue(null), 30000)
    return () => clearTimeout(timer)
  }, [value])

  async function perform(action: 'reveal' | 'copy') {
    setLoading(true)
    setError(null)
    const result = await getCredentialSecret(credentialId, field, action)
    setLoading(false)

    // Clients are asked to confirm their password first
    if (result.error === 'password_required') {
      setPending(action)
      return
    }

    if (result.error || result.value === undefined) {
      setError(result.error || 'Something went wrong')
      return
    }

    setPending(null)

    if (action === 'reveal') {
      setValue(result.value)
      return
    }

    try {
      await navigator.clipboard.writeText(result.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy. Click Copy again, or check that your browser allows clipboard access.')
    }
  }

  function handleReveal() {
    if (value !== null) {
      setValue(null)
      return
    }
    perform('reveal')
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!pending) return

    setLoading(true)
    setError(null)
    const result = await unlockCredentials(password)
    setLoading(false)
    setPassword('')

    if (result.error === 'no_password') {
      setPending(null)
      setError(
        'Your account was created with Google, so it has no password yet. Use "Forgot password" on the login page to set one, then come back here.'
      )
      return
    }

    if (result.error || !result.ok) {
      setError(result.error || 'Could not unlock')
      return
    }

    const action = pending
    setPending(null)
    await perform(action)
  }

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gray-400">{label}:</span>
        {field === 'password' && (
          <span className="font-mono text-gray-700">{value !== null ? value : '••••••••'}</span>
        )}
        <button
          type="button"
          onClick={handleReveal}
          disabled={loading}
          className="rounded border px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {value !== null ? 'Hide' : 'Reveal'}
        </button>
        <button
          type="button"
          onClick={() => perform('copy')}
          disabled={loading}
          className="rounded border px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {pending && (
        <form onSubmit={handleUnlock} className="mt-2 rounded border bg-amber-50 p-2">
          <p className="mb-1 text-xs text-amber-800">
            For your security, please confirm your account password. It stays unlocked for 5 minutes.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your account password"
              className="flex-1 rounded border border-gray-300 p-1 text-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-50"
            >
              Unlock
            </button>
            <button
              type="button"
              onClick={() => {
                setPending(null)
                setPassword('')
                setError(null)
              }}
              className="rounded border px-2 py-1 text-xs text-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {field === 'notes' && value !== null && (
        <pre className="mt-1 whitespace-pre-wrap rounded border bg-gray-50 p-2 font-mono text-xs text-gray-700">{value}</pre>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}