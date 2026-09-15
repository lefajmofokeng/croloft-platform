'use client'

import { useState } from 'react'
import { createInvoice } from './actions'

type Client = { id: string; full_name: string | null; email: string | null }
type Project = { id: string; name: string; client_id: string }

export default function InvoiceForm({
  clients,
  projects,
}: {
  clients: Client[]
  projects: Project[]
}) {
  const [selectedClientId, setSelectedClientId] = useState('')

  const filteredProjects = projects.filter((p) => p.client_id === selectedClientId)

  return (
    <form action={createInvoice} className="space-y-4 rounded border p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          name="client_id"
          required
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name || client.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Linked Project (optional — leave blank for a service-only invoice)
        </label>
        <select
          name="project_id"
          disabled={!selectedClientId}
          className="mt-1 w-full rounded border border-gray-300 p-2 disabled:bg-gray-100"
        >
          <option value="">None</option>
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {selectedClientId && filteredProjects.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">This client has no projects yet.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice Title</label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Technical Support — September"
          className="mt-1 w-full rounded border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date (optional)</label>
        <input type="date" name="due_date" className="mt-1 w-full rounded border border-gray-300 p-2" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Line Items</label>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                name="item_label"
                placeholder="Description"
                className="flex-1 rounded border border-gray-300 p-2 text-sm"
              />
              <input
                type="number"
                name="item_price"
                step="0.01"
                placeholder="R Amount"
                className="w-32 rounded border border-gray-300 p-2 text-sm"
              />
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