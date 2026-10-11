import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateCredential, deleteCredential } from '../../actions'
import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { CREDENTIAL_TYPES, CREDENTIAL_ENVIRONMENTS } from '@/lib/credential-options'

export default async function EditCredentialPage({
  params,
}: {
  params: Promise<{ credentialId: string }>
}) {
  const { credentialId } = await params
  const supabase = await createClient()

  const { data: cred } = await supabase
    .from('access_credentials')
    .select('*, profiles(full_name, email)')
    .eq('id', credentialId)
    .single()

  if (!cred) {
    notFound()
  }

  const { data: projects } = cred.client_id
    ? await supabase.from('projects').select('id, name').eq('client_id', cred.client_id).order('name')
    : { data: [] }

  // Only these two true/false values go to the page. The stored values themselves never do.
  const hasPassword = !!cred.password_encrypted
  const hasNotes = !!cred.secret_notes_encrypted
  const isGuest = !cred.client_id

  const input = 'mt-1 w-full rounded border border-gray-300 p-2 text-sm'

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Edit Credential</h1>
      <p className="mb-6 text-sm text-gray-500">
        {cred.profiles?.full_name || cred.profiles?.email || `${cred.guest_name} (guest)`}
      </p>

      <form action={updateCredential} className="mb-4 space-y-4 rounded border p-4">
        <input type="hidden" name="id" value={cred.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Linked Project (optional)</label>
          <select
            name="project_id"
            defaultValue={cred.project_id || ''}
            disabled={isGuest}
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm disabled:bg-gray-100"
          >
            <option value="">None</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">System name</label>
            <input type="text" name="system_name" defaultValue={cred.system_name} required className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select name="type" defaultValue={cred.type} className={input}>
              {CREDENTIAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL or host</label>
            <input type="text" name="url" defaultValue={cred.url || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Environment</label>
            <select name="environment" defaultValue={cred.environment || ''} className={input}>
              <option value="">Not specified</option>
              {CREDENTIAL_ENVIRONMENTS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" defaultValue={cred.username || ''} autoComplete="off" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant / org ID</label>
            <input type="text" name="tenant" defaultValue={cred.tenant || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role / access level</label>
            <input type="text" name="role_access" defaultValue={cred.role_access || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last changed</label>
            <input type="date" name="last_changed" defaultValue={cred.last_changed || ''} className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">MFA / 2FA notes</label>
          <input type="text" name="mfa_notes" defaultValue={cred.mfa_notes || ''} className={input} />
        </div>

        <div className="rounded border bg-gray-50 p-3">
          <label className="block text-sm font-medium text-gray-700">
            Password {hasPassword ? '(one is stored)' : '(none stored)'}
          </label>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={hasPassword ? 'Leave blank to keep the current password' : 'Enter a password'}
            className={input}
          />
          {hasPassword && (
            <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" name="clear_password" />
              Remove the stored password
            </label>
          )}
        </div>

        <div className="rounded border bg-gray-50 p-3">
          <label className="block text-sm font-medium text-gray-700">
            Secret notes {hasNotes ? '(some are stored)' : '(none stored)'}
          </label>
          <textarea
            name="secret_notes"
            rows={3}
            autoComplete="off"
            placeholder={hasNotes ? 'Leave blank to keep the current notes' : 'Recovery codes, API keys…'}
            className={input}
          />
          {hasNotes && (
            <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" name="clear_notes" />
              Remove the stored notes
            </label>
          )}
        </div>

        <div className="rounded border bg-gray-50 p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="shared_with_client"
              defaultChecked={cred.shared_with_client}
              disabled={isGuest}
            />
            Share with client (they&apos;ll see it in their portal)
          </label>
          <p className="mt-1 text-xs text-gray-400">
            {isGuest
              ? 'Not available until the client has an account.'
              : 'Turning this on or off is recorded in the audit log.'}
          </p>
        </div>

        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

      <ConfirmSubmitButton
        action={deleteCredential}
        hiddenFields={{ id: cred.id }}
        buttonLabel="Delete Credential"
        buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
        confirmTitle="Delete this credential?"
        confirmMessage="The stored password and notes will be permanently removed. The deletion is recorded in the audit log."
      />
    </div>
  )
}