import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const ACTION_LABELS: Record<string, string> = {
  reveal_password: 'Revealed password',
  copy_password: 'Copied password',
  reveal_notes: 'Revealed secret notes',
  copy_notes: 'Copied secret notes',
  password_changed: 'Changed password',
  password_removed: 'Removed password',
  notes_changed: 'Changed secret notes',
  notes_removed: 'Removed secret notes',
  share_on: 'Switched sharing ON',
  share_off: 'Switched sharing OFF',
  deleted: 'Deleted credential',
}

export default async function CredentialLogPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('credential_access_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="p-8">
      <Link href="/admin/credentials" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to credentials
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Credential Access Log</h1>
      <p className="mb-6 text-sm text-gray-500">
        Every reveal, copy, change, sharing switch and deletion. Showing the latest 200 entries.
      </p>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Who</th>
              <th className="p-3">Action</th>
              <th className="p-3">System</th>
            </tr>
          </thead>
          <tbody>
            {entries?.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-3 whitespace-nowrap text-gray-500">
                  {new Date(entry.created_at).toLocaleString('en-ZA')}
                </td>
                <td className="p-3">
                  {entry.accessed_by_name || 'Unknown'}
                  {entry.accessor_role === 'client' && (
                    <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Client</span>
                  )}
                </td>
                <td className="p-3">{ACTION_LABELS[entry.action] || entry.action}</td>
                <td className="p-3">{entry.system_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries?.length === 0 && <p className="mt-4 text-gray-500">Nothing logged yet.</p>}
    </div>
  )
}