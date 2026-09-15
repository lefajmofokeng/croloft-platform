import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateProduct } from '../../../actions'
import DeleteProductButton from '../../../delete-product-button'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('pricing_products')
    .select('*')
    .eq('id', productId)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form action={updateProduct} className="mb-4 space-y-3 rounded border p-4">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="category_id" value={product.category_id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" defaultValue={product.name} required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea name="description" defaultValue={product.description || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div className="rounded border bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Base Price (once-off): <span className="font-semibold text-gray-800">R{product.base_price}</span></p>
          <p className="text-sm text-gray-500">Monthly Price: <span className="font-semibold text-gray-800">R{product.monthly_price}</span></p>
          <p className="mt-1 text-xs text-gray-400">Calculated automatically from this product&apos;s &quot;Included&quot; add-ons — manage them from the product page.</p>
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

      <DeleteProductButton productId={product.id} categoryId={product.category_id} />
    </div>
  )
}