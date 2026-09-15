import { createClient } from '@/lib/supabase/server'
import { createTicket } from '../actions'

export default async function NewTicketPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  const hasProjects = projects && projects.length > 0

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">New Support Ticket</h1>

      <form action={createTicket} className="space-y-4 rounded border p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Which project or service is this about?
          </label>
          <select
            name="project_id"
            required={hasProjects}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            {!hasProjects && <option value="">General Inquiry (no active project)</option>}
            {hasProjects && <option value="">Select a project</option>}
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input type="text" name="subject" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select name="priority" defaultValue="medium" className="mt-1 w-full rounded border border-gray-300 p-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Describe your issue</label>
          <textarea name="message" required rows={5} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Submit Ticket
        </button>
      </form>
    </div>
  )
}