import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/admin/projects/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Assign Project
        </Link>
      </div>

      <div className="space-y-2">
        {projects?.map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="block rounded border p-4 hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-gray-500">
                  {project.profiles?.full_name || project.profiles?.email}
                </p>
              </div>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                {statusLabels[project.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {projects?.length === 0 && <p className="text-gray-500">No projects yet.</p>}
    </div>
  )
}