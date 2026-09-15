'use client'

import { useState } from 'react'

export default function ConfirmSubmitButton({
  action,
  hiddenFields,
  buttonLabel,
  buttonClassName,
  confirmTitle,
  confirmMessage,
}: {
  action: (formData: FormData) => void | Promise<void>
  hiddenFields: Record<string, string>
  buttonLabel: string
  buttonClassName?: string
  confirmTitle: string
  confirmMessage: string
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={buttonClassName || 'text-sm text-red-600 hover:text-red-800'}
      >
        {buttonLabel}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">{confirmTitle}</h2>
            <p className="mb-4 text-sm text-gray-600">{confirmMessage}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded border border-gray-300 py-2 text-sm"
              >
                Cancel
              </button>
              <form action={action} className="flex-1">
                {Object.entries(hiddenFields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <button type="submit" className="w-full rounded bg-red-600 py-2 text-sm text-white">
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}