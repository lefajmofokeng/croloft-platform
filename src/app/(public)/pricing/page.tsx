import { createClient } from '@/lib/supabase/server'

export default async function PublicPricingPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('pricing_categories')
    .select('*, pricing_products(*)')
    .order('display_order', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Pricing Calculator</h1>
      <p className="mb-8 text-gray-500">
        Select a service below to build a custom estimate.
      </p>

      <div className="space-y-8">
        {categories?.map((category) => (
          <div key={category.id}>
            <h2 className="mb-3 text-xl font-semibold">{category.name}</h2>
            {category.description && (
              <p className="mb-3 text-sm text-gray-500">{category.description}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {category.pricing_products?.map(
                (product: {
                  id: string
                  name: string
                  description: string | null
                  base_price: number
                }) => (
                  <a
                    key={product.id}
                    href={`/pricing/${product.id}`}
                    className="rounded border p-4 hover:border-blue-400 hover:shadow-sm"
                  >
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-gray-500">{product.description}</p>
                    )}
                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      From R{product.base_price}
                    </p>
                  </a>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}