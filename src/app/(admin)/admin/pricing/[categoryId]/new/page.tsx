import { createProduct } from '../../actions'

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form action={createProduct} className="space-y-3 rounded border p-4">
        <input type="hidden" name="category_id" value={categoryId} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea name="description" className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <p className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-gray-600">
          Base price and monthly price will be calculated automatically once you add &quot;Included&quot; add-ons to this product after creating it.
        </p>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Add Product
        </button>
      </form>
    </div>
  )
}