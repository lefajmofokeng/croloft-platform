import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ExpiryBadge from '@/components/expiry-badge'
import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { assetTypeLabel, assetStatusLabel } from '@/lib/asset-options'
import { deleteAsset } from './actions'

export default async function AdminAssetsPage() {
  const supabase = await createClient()

  const { data: assets } = await supabase
    .from('assets')
    .select('*, profiles(full_name, email), projects(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Link href="/admin/assets/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Add Asset
        </Link>
      </div>

      <div className="space-y-2">
        {assets?.map((asset) => (
          <div key={asset.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{asset.name}</p>
                <p className="text-sm text-gray-500">
                  {asset.profiles?.full_name || asset.profiles?.email || `${asset.guest_name} (guest)`}
                  {asset.projects?.name ? ` • ${asset.projects.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-gray-100 px-2 py-1">{assetTypeLabel(asset.asset_type)}</span>
                <span className="rounded bg-gray-100 px-2 py-1">{assetStatusLabel(asset.status)}</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
              {(asset.make || asset.model) && (
                <div><span className="text-gray-400">Make/Model:</span> {[asset.make, asset.model].filter(Boolean).join(' ')}</div>
              )}
              {asset.serial_number && <div><span className="text-gray-400">Serial:</span> {asset.serial_number}</div>}
              {asset.location && <div><span className="text-gray-400">Location:</span> {asset.location}</div>}
              {asset.warranty_expiry && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Warranty:</span> {asset.warranty_expiry}
                  <ExpiryBadge date={asset.warranty_expiry} />
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <Link href={`/admin/assets/${asset.id}/edit`} className="text-xs text-gray-500 hover:text-gray-800">
                Edit
              </Link>
              <ConfirmSubmitButton
                action={deleteAsset}
                hiddenFields={{ id: asset.id }}
                buttonLabel="Delete"
                buttonClassName="text-xs text-red-600 hover:text-red-800"
                confirmTitle="Delete this asset?"
                confirmMessage="This cannot be undone."
              />
            </div>
          </div>
        ))}
      </div>

      {assets?.length === 0 && <p className="text-gray-500">No assets yet.</p>}
    </div>
  )
}