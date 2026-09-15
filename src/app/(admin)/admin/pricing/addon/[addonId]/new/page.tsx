import { createAddonOption } from '../../../actions'

export default async function NewAddonOptionPage({
  params,
}: {
  params: Promise<{ addonId: string }>
}) {
  const { addonId } = await params

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Option</h1>

      <form action={createAddonOption} className="space-y-3 rounded border p-4">
        <input type="hidden" name="addon_id" value={addonId} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Label</label>
          <input type="text" name="label" required placeholder='e.g. "Standard"' className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (R)</label>
          <input type="number" name="price" step="0.01" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_default" id="is_default" className="h-4 w-4" />
          <label htmlFor="is_default" className="text-sm text-gray-700">
            Set as default (pre-selected when a client opens the calculator)
          </label>
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Add Option
        </button>
      </form>
    </div>
  )
}