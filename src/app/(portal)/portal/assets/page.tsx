import { createClient } from '@/lib/supabase/server'
import ExpiryBadge from '@/components/expiry-badge'
import { assetTypeLabel, assetStatusLabel } from '@/lib/asset-options'
import PrintAssetsButton from '@/components/print-assets-button'

export default async function PortalAssetsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: assets } = await supabase
    .from('assets')
    .select('*, projects(name)')
    .eq('client_id', user!.id)
    .order('name')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Your Equipment</h1>
          <p className="text-sm text-gray-500">Equipment Croloft manages or has recorded for you.</p>
        </div>
        {assets && assets.length > 0 && (
          <PrintAssetsButton assets={assets} clientName={profile?.full_name || profile?.email || ''} />
        )}
      </div>

      <div className="space-y-3">
        {assets?.map((asset) => (
          <div key={asset.id} className="rounded border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{asset.name}</p>
                {asset.projects?.name && <p className="text-sm text-gray-500">{asset.projects.name}</p>}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-gray-100 px-2 py-1">{assetTypeLabel(asset.asset_type)}</span>
                <span className="rounded bg-gray-100 px-2 py-1">{assetStatusLabel(asset.status)}</span>
              </div>
            </div>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
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
          </div>
        ))}
      </div>

      {assets?.length === 0 && <p className="text-gray-500">No equipment on file yet.</p>}
    </div>
  )
}