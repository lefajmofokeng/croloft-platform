'use client'

import { useState } from 'react'
import { getDocumentDownloadUrl } from './actions'

export default function DocumentDownloadButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const result = await getDocumentDownloadUrl(documentId)
    setLoading(false)

    if (result.error || !result.url) {
      alert(result.error || 'Could not open document')
      return
    }

    window.open(result.url, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-blue-600 hover:underline disabled:opacity-50"
    >
      {loading ? 'Opening...' : 'View / Download'}
    </button>
  )
}