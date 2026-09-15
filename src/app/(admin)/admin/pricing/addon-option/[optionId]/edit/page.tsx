import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateAddonOption } from '../../../actions'
import DeleteAddonOptionButton from '../../../delete-addon-option-button'

export default async function EditAddonOptionPage({
  params,
}: {
  params: Promise<{ optionId: string }>
}) {
  const { optionId } = await params
  const supabase = await createClient()

  const { data: option } = await supabase
    .from('pricing_addon_options')
    .select('*')
    .eq('id', optionId)
    .single()

  if (!option) {
    notFound()
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Option</h1>

      <form action={updateAddonOption} className="mb-4 space-y-3 rounded border p-4">
        <input type="hidden" name="id" value={option.id} />
        <input type="hidden" name="addon_id" value={option.addon_id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Label</label>
          <input type="text" name="label" defaultValue={option.label} required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (R)</label>
          <input type="number" name="price" step="0.01" defaultValue={option.price} required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_default" id="is_default" defaultChecked={option.is_default} className="h-4 w-4" />
          <label htmlFor="is_default" className="text-sm text-gray-700">
            Set as default (pre-selected when a client opens the calculator)
          </label>
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

      <DeleteAddonOptionButton optionId={option.id} addonId={option.addon_id} />
    </div>
  )
}