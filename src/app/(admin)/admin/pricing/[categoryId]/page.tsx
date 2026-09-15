import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('pricing_categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (!category) {
    notFound()
  }

  const { data: products } = await supabase
    .from('pricing_products')
    .select('*')
    .eq('category_id', categoryId)
    .order('display_order', { ascending: true })

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <Link href={`/admin/pricing/${categoryId}/new`} className="rounded bg-blue-600 px-4 py-2 text-white">
          + Add Product
        </Link>
      </div>
      <p className="text-gray-500 mb-6">{category.description}</p>

      <ul className="space-y-2">
        {products?.map((product) => (
          <li key={product.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <Link href={`/admin/pricing/product/${product.id}`} className="font-medium text-blue-600 hover:underline">
                {product.name}
              </Link>
              <p className="text-sm text-gray-500">
                R{product.base_price} once-off
                {product.monthly_price > 0 && ` + R${product.monthly_price}/month`}
              </p>
            </div>
            <Link href={`/admin/pricing/product/${product.id}/edit`} className="text-sm text-gray-500 hover:text-gray-800">
              Edit
            </Link>
          </li>
        ))}
      </ul>

      {products?.length === 0 && <p className="text-gray-500">No products yet.</p>}
    </div>
  )
}