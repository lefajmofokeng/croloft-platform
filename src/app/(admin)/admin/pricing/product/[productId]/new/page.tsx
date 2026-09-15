import { createAddon } from '../../../actions'

export default async function NewAddonPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Add-on</h1>

      <form action={createAddon} className="space-y-3 rounded border p-4">
        <input type="hidden" name="product_id" value={productId} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="type" required className="mt-1 w-full rounded border border-gray-300 p-2">
            <option value="included">Included (locked, part of base price)</option>
            <option value="dropdown">Dropdown (fixed choices)</option>
            <option value="numeric">Numeric (price per unit)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
          <select name="billing_cycle" defaultValue="once_off" required className="mt-1 w-full rounded border border-gray-300 p-2">
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
          <input type="number" name="unit_price" step="0.01" className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit Label (only for Numeric — e.g. &quot;user&quot;, &quot;server&quot;)
          </label>
          <input type="text" name="unit_label" className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Included Free Quantity (only for Numeric — e.g. first 5 free)
          </label>
          <input type="number" name="included_quantity" defaultValue={0} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Add Add-on
        </button>
      </form>
    </div>
  )
}