'use client'

import { useState } from 'react'

type Version = { id: string; storage_path: string; file_name: string; replaced_at: string }

export default function DocumentVersionHistory({
  versions,
  getUrl,
}: {
  versions: Version[]
  getUrl: (path: string, fileName: string) => Promise<{ url?: string; error?: string }>
}) {
  const [open, setOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (versions.length === 0) return null

  async function handleDownload(version: Version) {
    setLoadingId(version.id)
    const result = await getUrl(version.storage_path, version.file_name)
    setLoadingId(null)

    if (result.error || !result.url) {
      alert(result.error || 'Could not open file')
      return
    }
    window.open(result.url, '_blank')
  }

  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)} className="text-xs text-gray-500 hover:underline">
        {open ? 'Hide' : 'Show'} {versions.length} previous version{versions.length > 1 ? 's' : ''}
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
          {versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{v.file_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{new Date(v.replaced_at).toLocaleDateString('en-ZA')}</span>
                <button
                  onClick={() => handleDownload(v)}
                  disabled={loadingId === v.id}
                  className="text-blue-600 hover:underline disabled:opacity-50"
                >
                  {loadingId === v.id ? '...' : 'View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}