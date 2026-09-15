'use client'

import { useState } from 'react'
import { updateProjectDocument, deleteProjectDocument } from './actions'
import ConfirmSubmitButton from '@/components/confirm-submit-button'

type Document = {
  id: string
  project_id: string
  name: string
  description: string | null
  storage_path: string
  created_at: string
}

export default function DocumentRow({ doc }: { doc: Document }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    await updateProjectDocument(formData)
    setSaving(false)
    setEditing(false)
  }

    if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2 rounded border p-3">
        <input type="hidden" name="id" value={doc.id} />
        <input type="hidden" name="project_id" value={doc.project_id} />
        <input type="hidden" name="old_storage_path" value={doc.storage_path} />
        <input
          type="text"
          name="name"
          defaultValue={doc.name}
          required
          className="w-full rounded border border-gray-300 p-2 text-sm"
        />
        <textarea
          name="description"
          defaultValue={doc.description || ''}
          rows={2}
          className="w-full rounded border border-gray-300 p-2 text-sm"
        />
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Current file: <span className="font-medium text-gray-700">{extractFileName(doc.storage_path)}</span>
          </label>
          <input type="file" name="file" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          <p className="mt-1 text-xs text-gray-400">Leave empty to keep the current file</p>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-xs">
            Cancel
          </button>
        </div>
      </form>
    )
  }

  function extractFileName(storagePath: string): string {
    const parts = storagePath.split('/')
    const fileWithTimestamp = parts[parts.length - 1]
    // Strip the "1234567890-" timestamp prefix we add on upload
    return fileWithTimestamp.replace(/^\d+-/, '')
    }

  return (
    <div className="flex items-center justify-between rounded border p-3">
      <div>
        <p className="font-medium">{doc.name}</p>
        {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
        <p className="mt-1 text-xs text-gray-400">
          {new Date(doc.created_at).toLocaleDateString('en-ZA')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setEditing(true)} className="text-sm text-gray-500 hover:text-gray-800">
          Edit
        </button>
        <ConfirmSubmitButton
          action={deleteProjectDocument}
          hiddenFields={{ id: doc.id, project_id: doc.project_id, storage_path: doc.storage_path }}
          buttonLabel="Delete"
          confirmTitle="Delete this document?"
          confirmMessage="This will permanently remove the file. This cannot be undone."
        />
      </div>
    </div>
  )
}