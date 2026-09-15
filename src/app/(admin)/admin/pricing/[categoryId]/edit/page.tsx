import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateCategory, deleteCategory } from '../../actions'
import DeleteCategoryButton from '../../delete-category-button'

export default async function EditCategoryPage({
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

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>

      <form action={updateCategory} className="mb-4 space-y-3 rounded border p-4">
        <input type="hidden" name="id" value={category.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={category.name}
            required
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            name="description"
            defaultValue={category.description || ''}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

            <DeleteCategoryButton categoryId={category.id} />
    </div>
  )
}