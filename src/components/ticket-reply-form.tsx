'use client'

import { useState, useRef } from 'react'

export default function TicketReplyForm({
  action,
  ticketId,
}: {
  action: (formData: FormData) => void | Promise<void>
  ticketId: string
}) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || [])
    const newPreviews = newFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))

    // Append to whatever was already selected, instead of replacing
    setPreviews((prev) => [...prev, ...newPreviews])

    // Clear the input's own value so the same files can be re-picked later if needed,
    // and so the next selection doesn't get merged oddly by the browser
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removeFile(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget // capture BEFORE the await, not after

    const formData = new FormData()
    formData.set('ticket_id', ticketId)
    formData.set('message', message)
    previews.forEach(({ file }) => formData.append('attachments', file))

    await action(formData)

    setPreviews([])
    setMessage('')
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded border p-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={3}
        placeholder="Type your reply..."
        className="w-full rounded border border-gray-300 p-2"
      />

      <div>
        <label className="block text-xs font-medium text-gray-500">
          Attach screenshots (optional — you can select multiple times to add more)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
        />
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview, i) => (
            <div key={i} className="relative">
              <img src={preview.url} alt="" className="h-20 w-20 rounded border object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Send Reply
      </button>
    </form>
  )
}