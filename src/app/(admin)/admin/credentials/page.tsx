import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { credentialTypeLabel, credentialEnvironmentLabel } from '@/lib/credential-options'
import SecretField from '@/components/secret-field'

export default async function AdminCredentialsPage() {
  const supabase = await createClient()

  const { data: credentials } = await supabase
    .from('access_credentials')
    .select('*, profiles(full_name, email), projects(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Access Credentials</h1>
        <Link href="/admin/credentials/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Add Credential
        </Link>
      </div>

      <div className="space-y-2">
        {credentials?.map((cred) => (
          <div key={cred.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{cred.system_name}</p>
                <p className="text-sm text-gray-500">
                  {cred.profiles?.full_name || cred.profiles?.email || `${cred.guest_name} (guest)`}
                  {cred.projects?.name ? ` • ${cred.projects.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-gray-100 px-2 py-1">{credentialTypeLabel(cred.type)}</span>
                {cred.environment && (
                  <span className="rounded bg-gray-100 px-2 py-1">{credentialEnvironmentLabel(cred.environment)}</span>
                )}
                {cred.shared_with_client && (
                  <span className="rounded bg-green-100 px-2 py-1 text-green-700">Shared with client</span>
                )}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
              {cred.url && <div><span className="text-gray-400">URL:</span> {cred.url}</div>}
              {cred.username && <div><span className="text-gray-400">Username:</span> {cred.username}</div>}
              {cred.tenant && <div><span className="text-gray-400">Tenant:</span> {cred.tenant}</div>}
              {cred.role_access && <div><span className="text-gray-400">Role:</span> {cred.role_access}</div>}
              {cred.mfa_notes && (
                <div className="col-span-2"><span className="text-gray-400">MFA:</span> {cred.mfa_notes}</div>
              )}
              {cred.password_encrypted && (
                <div className="col-span-2">
                  <SecretField credentialId={cred.id} field="password" label="Password" />
                </div>
              )}
              {cred.secret_notes_encrypted && (
                <div className="col-span-2">
                  <SecretField credentialId={cred.id} field="notes" label="Secret notes" />
                </div>
              )}
              {cred.last_changed && <div><span className="text-gray-400">Last changed:</span> {cred.last_changed}</div>}
            </div>
          </div>
        ))}
      </div>

      {credentials?.length === 0 && <p className="text-gray-500">No credentials stored yet.</p>}
    </div>
  )
}