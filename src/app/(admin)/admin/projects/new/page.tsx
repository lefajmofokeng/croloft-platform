import { createClient } from '@/lib/supabase/server'
import { createProject } from '../actions'

export default async function NewProjectPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Assign Project</h1>

      <form action={createProject} className="space-y-3 rounded border p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select name="client_id" required className="mt-1 w-full rounded border border-gray-300 p-2">
            <option value="">Select a client</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name || client.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input type="text" name="name" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" defaultValue="planning" className="mt-1 w-full rounded border border-gray-300 p-2">
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="start_date" className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Completion</label>
            <input type="date" name="target_completion_date" className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Assign Project
        </button>
      </form>
    </div>
  )
}