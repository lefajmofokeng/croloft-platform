'use client'

import { useState } from 'react'

export default function AddonInfoIcon({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-xs text-gray-500"
        aria-label="More info"
      >
        i
      </button>
      {open && (
        <span className="absolute left-0 top-5 z-10 w-56 rounded border bg-white p-2 text-xs font-normal text-gray-600 shadow-lg">
          {text}
        </span>
      )}
    </span>
  )
}