import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateProject, deleteProject, addProjectUpdate, uploadProjectDocument } from '../actions'
import DocumentRow from '../document-row'
import ConfirmSubmitButton from '@/components/confirm-submit-button'

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name, email)')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  const { data: updates } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  const { data: documents } = await supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })  
  
    return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">{project.name}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {project.profiles?.full_name || project.profiles?.email}
      </p>

      <form action={updateProject} className="mb-6 space-y-3 rounded border p-4">
        <input type="hidden" name="id" value={project.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input type="text" name="name" defaultValue={project.name} required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" defaultValue={project.description || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" defaultValue={project.status} className="mt-1 w-full rounded border border-gray-300 p-2">
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="start_date" defaultValue={project.start_date || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Completion</label>
            <input type="date" name="target_completion_date" defaultValue={project.target_completion_date || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Save Changes
        </button>
      </form>

      <ConfirmSubmitButton
        action={deleteProject}
        hiddenFields={{ id: project.id }}
        buttonLabel="Delete Project"
        buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
        confirmTitle="Delete this project?"
        confirmMessage="This will also delete its timeline updates and documents. This cannot be undone."
      />

      <h2 className="mb-3 mt-8 font-semibold">Post an Update</h2>
      <form action={addProjectUpdate} className="mb-6 space-y-3 rounded border p-4">
        <input type="hidden" name="project_id" value={project.id} />
        <textarea
          name="note"
          required
          rows={2}
          placeholder="e.g. Week 3: design approved, moving to development"
          className="w-full rounded border border-gray-300 p-2"
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Post Update
        </button>
      </form>

      <h2 className="mb-3 font-semibold">Timeline</h2>
      <div className="space-y-3">
        {updates?.map((update) => (
          <div key={update.id} className="rounded border p-3">
            <p className="text-sm">{update.note}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(update.created_at).toLocaleString('en-ZA')}
            </p>
          </div>
        ))}
      </div>

    <h2 className="mb-3 mt-8 font-semibold">Documents</h2>
      <form
        action={uploadProjectDocument}
        className="mb-4 space-y-3 rounded border p-4"
      >
        <input type="hidden" name="project_id" value={project.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Document Name</label>
          <input type="text" name="name" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" rows={2} placeholder="What is this document about?" className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">File</label>
          <input type="file" name="file" required className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Upload Document
        </button>
      </form>

      <div className="space-y-2">
        {documents?.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} />
        ))}
      </div>

      {documents?.length === 0 && <p className="text-gray-500">No documents yet.</p>}

      {updates?.length === 0 && <p className="text-gray-500">No updates yet.</p>}
    </div>

  )
}

function DeleteProjectButtonInline() {
  return (
    <button type="submit" className="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50">
      Delete Project
    </button>
  )
}