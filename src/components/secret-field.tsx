'use client'

import { useState, useEffect } from 'react'
import { getCredentialSecret } from '@/lib/credential-actions'

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

  // Hide it again automatically after 30 seconds
  useEffect(() => {
    if (value === null) return
    const timer = setTimeout(() => setValue(null), 30000)
    return () => clearTimeout(timer)
  }, [value])

  async function handleReveal() {
    if (value !== null) {
      setValue(null)
      return
    }

    setLoading(true)
    setError(null)
    const result = await getCredentialSecret(credentialId, field, 'reveal')
    setLoading(false)

    if (result.error || result.value === undefined) {
      setError(result.error || 'Something went wrong')
      return
    }
    setValue(result.value)
  }

  async function handleCopy() {
    setLoading(true)
    setError(null)
    const result = await getCredentialSecret(credentialId, field, 'copy')
    setLoading(false)

    if (result.error || result.value === undefined) {
      setError(result.error || 'Something went wrong')
      return
    }

    try {
      await navigator.clipboard.writeText(result.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy. Your browser may be blocking clipboard access.')
    }
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
          onClick={handleCopy}
          disabled={loading}
          className="rounded border px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {field === 'notes' && value !== null && (
        <pre className="mt-1 whitespace-pre-wrap rounded border bg-gray-50 p-2 font-mono text-xs text-gray-700">{value}</pre>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}