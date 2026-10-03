import { createClient } from '@/lib/supabase/server'

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export default async function PortalProjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Projects</h1>

      <div className="space-y-3">
        {projects?.map((project) => (
          <a
            key={project.id}
            href={`/portal/projects/${project.id}`}
            className="block rounded border p-4 hover:border-blue-400 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-gray-400">{project.project_number}</p>
              </div>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                {statusLabels[project.status]}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-blue-600" style={{ width: `${project.progress_percent}%` }} />
            </div>
          </a>
        ))}
        {projects?.length === 0 && <p className="text-gray-500">No projects yet.</p>}
      </div>
    </div>
  )
}