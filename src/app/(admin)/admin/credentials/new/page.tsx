import { createClient } from '@/lib/supabase/server'
import CredentialForm from '../credential-form'

export default async function NewCredentialPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>
}) {
  const { projectId } = await searchParams
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_id')
    .order('name')

  // Coming from a project page: work out who the project belongs to, so the form can fill itself in
  let preset = null

  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, client_id, guest_name, guest_email')
      .eq('id', projectId)
      .single()

    if (project) {
      let ownerLabel = project.guest_name ? `${project.guest_name} (guest)` : 'Client'

      if (project.client_id) {
        const { data: owner } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', project.client_id)
          .single()
        ownerLabel = owner?.full_name || owner?.email || 'Client'
      }

      preset = {
        projectId: project.id,
        projectName: project.name,
        ownerLabel,
        clientId: project.client_id,
        guestName: project.guest_name,
        guestEmail: project.guest_email,
      }
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Add Credential</h1>
      <CredentialForm clients={clients || []} projects={projects || []} preset={preset} />
    </div>
  )
}