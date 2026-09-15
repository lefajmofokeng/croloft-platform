import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateAddon } from '../../../actions'
import DeleteAddonButton from '../../../delete-addon-button'

export default async function EditAddonPage({
  params,
}: {
  params: Promise<{ addonId: string }>
}) {
  const { addonId } = await params
  const supabase = await createClient()

  const { data: addon } = await supabase
    .from('pricing_addons')
    .select('*')
    .eq('id', addonId)
    .single()

  if (!addon) {
    notFound()
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Add-on</h1>

      <form action={updateAddon} className="mb-4 space-y-3 rounded border p-4">
        <input type="hidden" name="id" value={addon.id} />
        <input type="hidden" name="product_id" value={addon.product_id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" defaultValue={addon.name} required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="type" defaultValue={addon.type} required className="mt-1 w-full rounded border border-gray-300 p-2">
            <option value="included">Included (locked, part of base price)</option>
            <option value="dropdown">Dropdown (fixed choices)</option>
            <option value="numeric">Numeric (price per unit)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
          <select name="billing_cycle" defaultValue={addon.billing_cycle} required className="mt-1 w-full rounded border border-gray-300 p-2">
            <option value="once_off">Once-off</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            For &quot;Included&quot;: once-off builds the base price, monthly builds the maintenance price.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (flat price for Included; price per unit for Numeric)
          </label>
          <input type="number" name="unit_price" step="0.01" defaultValue={addon.unit_price ?? ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit Label (only for Numeric)
          </label>
          <input type="text" name="unit_label" defaultValue={addon.unit_label ?? ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Included Free Quantity (only for Numeric — e.g. first 5 free)
          </label>
          <input type="number" name="included_quantity" defaultValue={addon.included_quantity} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

      <DeleteAddonButton addonId={addon.id} productId={addon.product_id} />
    </div>
  )
}