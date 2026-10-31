'use client'

import { useState } from 'react'
import { createAsset } from './actions'
import { ASSET_TYPES, ASSET_STATUSES } from '@/lib/asset-options'

type Client = { id: string; full_name: string | null; email: string | null }
type Project = { id: string; name: string; client_id: string | null }

export default function AssetForm({
  clients,
  projects,
}: {
  clients: Client[]
  projects: Project[]
}) {
  const [mode, setMode] = useState<'existing' | 'guest'>('existing')
  const [clientId, setClientId] = useState('')

  const clientProjects = projects.filter((p) => p.client_id === clientId)
  const input = 'mt-1 w-full rounded border border-gray-300 p-2 text-sm'

  return (
    <form action={createAsset} className="space-y-4 rounded border p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <div className="mt-1 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
            Existing client
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'guest'} onChange={() => setMode('guest')} />
            New / guest client (not signed up)
          </label>
        </div>
      </div>

      {mode === 'existing' ? (
        <select
          name="client_id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          className="w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.full_name || client.email}</option>
          ))}
        </select>
      ) : (
        <div className="space-y-3 rounded border bg-gray-50 p-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Full Name or Company</label>
            <input type="text" name="guest_name" required className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Email (optional, enables auto-linking if they sign up later)</label>
            <input type="email" name="guest_email" className={input} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Linked Project (optional)</label>
        <select
          name="project_id"
          disabled={mode === 'guest' || !clientId}
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm disabled:bg-gray-100"
        >
          <option value="">None</option>
          {clientProjects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="asset_type" defaultValue="other" className={input}>
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name / Label</label>
          <input type="text" name="name" required placeholder="e.g. Reception PC" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Make</label>
          <input type="text" name="make" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input type="text" name="model" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Serial Number</label>
          <input type="text" name="serial_number" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" name="location" placeholder="e.g. Server room" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
          <input type="date" name="purchase_date" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Warranty Expiry</label>
          <input type="date" name="warranty_expiry" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" defaultValue="active" className={input}>
            {ASSET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea name="notes" rows={2} className={input} />
      </div>

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Save Asset
      </button>
    </form>
  )
}