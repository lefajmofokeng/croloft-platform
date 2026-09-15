'use client'

import { useState } from 'react'

export default function TicketAttachmentThumbnail({
  storagePath,
  fileName,
  getUrl,
}: {
  storagePath: string
  fileName: string
  getUrl: (path: string) => Promise<{ url?: string; error?: string }>
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const result = await getUrl(storagePath)
    setLoading(false)

    if (result.error || !result.url) {
      alert(result.error || 'Could not open attachment')
      return
    }

    window.open(result.url, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50"
    >
      📎 {loading ? 'Opening...' : fileName}
    </button>
  )
}