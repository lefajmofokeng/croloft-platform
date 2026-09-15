import { createCategory } from '../actions'

export default function NewCategoryPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Category</h1>

      <form action={createCategory} className="space-y-3 rounded border p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            required
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            name="description"
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Add Category
        </button>
      </form>
    </div>
  )
}