'use client'

import { useState } from 'react'
import { createInvoice } from './actions'
import { INVOICE_SOURCES } from '@/lib/invoice-source'

type Client = { id: string; full_name: string | null; email: string | null }
type Project = { id: string; name: string; client_id: string }

export default function InvoiceForm({
  clients,
  projects,
}: {
  clients: Client[]
  projects: Project[]
}) {
  const [mode, setMode] = useState<'existing' | 'guest'>('existing')
  const [selectedClientId, setSelectedClientId] = useState('')

  const filteredProjects = projects.filter((p) => p.client_id === selectedClientId)

  return (
    <form action={createInvoice} className="space-y-4 rounded border p-4">
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
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          required
          className="w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name || client.email}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-3 rounded border bg-gray-50 p-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Full Name</label>
            <input type="text" name="guest_name" required className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Email</label>
            <input type="email" name="guest_email" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Phone</label>
            <input type="tel" name="guest_phone" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Address</label>
            <textarea name="guest_address" rows={2} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
          </div>
          <p className="text-xs text-gray-400">
            This invoice won&apos;t appear in a portal since there&apos;s no account — you&apos;ll need to view/print it from here to send it to them.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Linked Project (optional{mode === 'guest' ? ' — guest clients have no projects to pick from' : ''})
        </label>
        <select
          name="project_id"
          disabled={mode === 'guest' || !selectedClientId}
          className="mt-1 w-full rounded border border-gray-300 p-2 disabled:bg-gray-100"
        >
          <option value="">None</option>
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice Title</label>
        <input type="text" name="title" required placeholder="e.g. Technical Support — September" className="mt-1 w-full rounded border border-gray-300 p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date (optional)</label>
        <input type="date" name="due_date" className="mt-1 w-full rounded border border-gray-300 p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">How did this invoice come about?</label>
        <select name="source" required defaultValue="" className="mt-1 w-full rounded border border-gray-300 p-2">
          <option value="">Select a reason</option>
          {INVOICE_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Line Items</label>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <input type="text" name="item_label" placeholder="Description" className="flex-1 rounded border border-gray-300 p-2 text-sm" />
              <input type="number" name="item_price" step="0.01" placeholder="R Amount" className="w-32 rounded border border-gray-300 p-2 text-sm" />
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400">Leave a row blank to skip it.</p>
      </div>

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Create Invoice
      </button>
    </form>
  )
}