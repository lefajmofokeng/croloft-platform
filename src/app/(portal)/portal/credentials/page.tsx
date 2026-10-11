import { createClient } from '@/lib/supabase/server'
import SecretField from '@/components/secret-field'
import { credentialTypeLabel, credentialEnvironmentLabel } from '@/lib/credential-options'

export default async function PortalCredentialsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The database already hides everything except the client's own shared credentials.
  // The filters below say the same thing in the code, so it is obvious what this page shows.
  const { data: credentials } = await supabase
    .from('access_credentials')
    .select('*, projects(name)')
    .eq('client_id', user!.id)
    .eq('shared_with_client', true)
    .order('system_name')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Your Credentials</h1>
      <p className="mb-6 text-sm text-gray-500">
        Logins your Croloft team has shared with you. Passwords stay hidden until you click Reveal or Copy,
        and each of those clicks is recorded. Please keep these private, and let us know if you think someone else has seen them.
      </p>

      <div className="space-y-3">
        {credentials?.map((cred) => (
          <div key={cred.id} className="rounded border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{cred.system_name}</p>
                {cred.projects?.name && <p className="text-sm text-gray-500">{cred.projects.name}</p>}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-gray-100 px-2 py-1">{credentialTypeLabel(cred.type)}</span>
                {cred.environment && (
                  <span className="rounded bg-gray-100 px-2 py-1">{credentialEnvironmentLabel(cred.environment)}</span>
                )}
              </div>
            </div>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {cred.url && <div><span className="text-gray-400">URL:</span> {cred.url}</div>}
              {cred.username && <div><span className="text-gray-400">Username:</span> {cred.username}</div>}
              {cred.tenant && <div><span className="text-gray-400">Tenant:</span> {cred.tenant}</div>}
              {cred.role_access && <div><span className="text-gray-400">Role:</span> {cred.role_access}</div>}
              {cred.mfa_notes && <div><span className="text-gray-400">MFA:</span> {cred.mfa_notes}</div>}
              {cred.last_changed && <div><span className="text-gray-400">Last changed:</span> {cred.last_changed}</div>}

              {cred.password_encrypted && (
                <SecretField credentialId={cred.id} field="password" label="Password" />
              )}
              {cred.secret_notes_encrypted && (
                <SecretField credentialId={cred.id} field="notes" label="Secret notes" />
              )}
            </div>
          </div>
        ))}
      </div>

      {credentials?.length === 0 && (
        <p className="text-gray-500">
          Nothing has been shared with you yet. If you need a login, contact your Croloft project lead.
        </p>
      )}
    </div>
  )
}