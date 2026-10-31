import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateAsset, deleteAsset } from '../../actions'
import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { ASSET_TYPES, ASSET_STATUSES } from '@/lib/asset-options'

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>
}) {
  const { assetId } = await params
  const supabase = await createClient()

  const { data: asset } = await supabase
    .from('assets')
    .select('*, profiles(full_name, email)')
    .eq('id', assetId)
    .single()

  if (!asset) {
    notFound()
  }

  const { data: projects } = asset.client_id
    ? await supabase.from('projects').select('id, name').eq('client_id', asset.client_id).order('name')
    : { data: [] }

  const input = 'mt-1 w-full rounded border border-gray-300 p-2 text-sm'

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Edit Asset</h1>
      <p className="mb-6 text-sm text-gray-500">
        {asset.profiles?.full_name || asset.profiles?.email || `${asset.guest_name} (guest)`}
      </p>

      <form action={updateAsset} className="mb-4 space-y-4 rounded border p-4">
        <input type="hidden" name="id" value={asset.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Linked Project (optional)</label>
          <select name="project_id" defaultValue={asset.project_id || ''} disabled={!asset.client_id} className={`${input} disabled:bg-gray-100`}>
            <option value="">None</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select name="asset_type" defaultValue={asset.asset_type} className={input}>
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name / Label</label>
            <input type="text" name="name" defaultValue={asset.name} required className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Make</label>
            <input type="text" name="make" defaultValue={asset.make || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input type="text" name="model" defaultValue={asset.model || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input type="text" name="serial_number" defaultValue={asset.serial_number || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" defaultValue={asset.location || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
            <input type="date" name="purchase_date" defaultValue={asset.purchase_date || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Warranty Expiry</label>
            <input type="date" name="warranty_expiry" defaultValue={asset.warranty_expiry || ''} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue={asset.status} className={input}>
              {ASSET_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea name="notes" rows={2} defaultValue={asset.notes || ''} className={input} />
        </div>

        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

      <ConfirmSubmitButton
        action={deleteAsset}
        hiddenFields={{ id: asset.id }}
        buttonLabel="Delete Asset"
        buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
        confirmTitle="Delete this asset?"
        confirmMessage="This cannot be undone."
      />
    </div>
  )
}