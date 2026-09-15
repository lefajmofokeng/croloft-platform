import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ProductPage({
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

  const { data: addons } = await supabase
    .from('pricing_addons')
    .select('*, pricing_addon_options(*)')
    .eq('product_id', productId)
    .order('display_order', { ascending: true })

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Link href={`/admin/pricing/product/${productId}/new`} className="rounded bg-blue-600 px-4 py-2 text-white">
          + Add Add-on
        </Link>
      </div>
      <p className="text-gray-500 mb-6">Base price: R{product.base_price}</p>

      <ul className="space-y-2">
        {addons?.map((addon) => (
          <li key={addon.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">
                {addon.name} <span className="text-xs text-gray-400">({addon.type})</span>
              </p>
              {addon.type === 'numeric' && (
                <p className="text-sm text-gray-500">R{addon.unit_price} per {addon.unit_label}</p>
              )}
              {addon.type === 'dropdown' && (
                <p className="text-sm text-gray-500">
                  {addon.pricing_addon_options?.length || 0} option(s) —{' '}
                  <Link href={`/admin/pricing/addon/${addon.id}`} className="text-blue-600 hover:underline">
                    manage options
                  </Link>
                </p>
              )}
            </div>
            <Link href={`/admin/pricing/addon/${addon.id}/edit`} className="text-sm text-gray-500 hover:text-gray-800">
              Edit
            </Link>
          </li>
        ))}
      </ul>

      {addons?.length === 0 && <p className="text-gray-500">No add-ons yet.</p>}
    </div>
  )
}