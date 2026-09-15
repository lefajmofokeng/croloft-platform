import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPricingPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('pricing_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    return <div className="p-8 text-red-600">Error loading categories: {error.message}</div>
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pricing Manager</h1>
        <Link href="/admin/pricing/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Add Category
        </Link>
      </div>

      <ul className="space-y-2">
        {categories?.map((category) => (
          <li key={category.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <Link href={`/admin/pricing/${category.id}`} className="font-medium text-blue-600 hover:underline">
                {category.name}
              </Link>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
            <Link
              href={`/admin/pricing/${category.id}/edit`}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>

      {categories?.length === 0 && <p className="text-gray-500">No categories yet.</p>}
    </div>
  )
}