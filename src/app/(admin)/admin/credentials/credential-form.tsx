'use client'

import { useState } from 'react'
import { createCredential } from './actions'
import { CREDENTIAL_TYPES, CREDENTIAL_ENVIRONMENTS } from '@/lib/credential-options'

type Client = { id: string; full_name: string | null; email: string | null }
type Project = { id: string; name: string; client_id: string | null }

export default function CredentialForm({
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
    <form action={createCredential} className="space-y-4 rounded border p-4">
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
            <option key={client.id} value={client.id}>
              {client.full_name || client.email}
            </option>
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
          <label className="block text-sm font-medium text-gray-700">System name</label>
          <input type="text" name="system_name" required placeholder="e.g. WordPress admin, Azure portal" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="type" defaultValue="application" className={input}>
            {CREDENTIAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL or host</label>
          <input type="text" name="url" placeholder="https://… or server address" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Environment</label>
          <select name="environment" defaultValue="" className={input}>
            <option value="">Not specified</option>
            {CREDENTIAL_ENVIRONMENTS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" name="username" autoComplete="off" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" autoComplete="new-password" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tenant / org ID</label>
          <input type="text" name="tenant" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role / access level</label>
          <input type="text" name="role_access" placeholder="e.g. Global Admin, read-only" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last changed</label>
          <input type="date" name="last_changed" className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">MFA / 2FA notes</label>
          <input type="text" name="mfa_notes" placeholder="e.g. Authenticator is on client's phone" className={input} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Secret notes (encrypted: recovery codes, API keys)</label>
        <textarea name="secret_notes" rows={3} autoComplete="off" className={input} />
      </div>

      <div className="rounded border bg-gray-50 p-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="shared_with_client" disabled={mode === 'guest'} />
          Share with client (they&apos;ll see it in their portal)
        </label>
        <p className="mt-1 text-xs text-gray-400">
          Off by default. {mode === 'guest' ? 'Not available until the client has an account.' : 'Only turn on for logins the client should hold themselves.'}
        </p>
      </div>

      <p className="text-xs text-gray-400">The password and secret notes are encrypted before they are saved.</p>

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Save Credential
      </button>
    </form>
  )
}