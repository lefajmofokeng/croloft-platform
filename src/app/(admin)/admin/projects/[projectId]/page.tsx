import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateProject, deleteProject, addProjectUpdate, uploadProjectDocument, addChangelogEntry, addInternalNote } from '../actions'
import DocumentRow from '../document-row'
import ConfirmSubmitButton from '@/components/confirm-submit-button'
import ExpiryBadge from '@/components/expiry-badge'
import QuotePricingTable from '@/components/quote-pricing-table'
import SecretField from '@/components/secret-field'
import { credentialTypeLabel, credentialEnvironmentLabel } from '@/lib/credential-options'
import MetricForm from '../metric-form'
import MetricsSection from '@/components/metrics-section'
import { deleteMetric } from '../metrics-actions'
import { updateRequestStatus } from '../actions'

type LineItem = { label: string; price: number; recurring?: boolean }
type HourlyItem = { label: string; rate: number; unit: string }

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

  const { data: projectCredentials } = await supabase
    .from('access_credentials')
    .select('*')
    .eq('project_id', projectId)
    .order('system_name')  

  const { data: linkedQuote } = project.quote_id
    ? await supabase.from('quotes').select('*').eq('id', project.quote_id).single()
    : { data: null }

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
    
  const { data: allVersions } = await supabase
    .from('project_document_versions')
    .select('*')
    .in('document_id', (documents || []).map((d) => d.id))
    .order('replaced_at', { ascending: false })  

  const { data: changelog } = await supabase
    .from('project_changelog')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    
  const { data: internalNotes } = await supabase
    .from('project_internal_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  const { data: metrics } = await supabase
    .from('project_metrics')
    .select('*')
    .eq('project_id', projectId)
    .order('period_date', { ascending: true })
    
  const { data: requests } = await supabase
    .from('project_requests')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">{project.name}</h1>
      <p className="mb-2 text-sm text-gray-500">
        {project.project_number} • {project.profiles?.full_name || project.profiles?.email || `${project.guest_name} (guest)`}
      </p>

      {!project.client_id && (
        <div className="mb-6 rounded border bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-800">Guest client — no portal account</p>
          <p className="text-amber-700">{project.guest_name}</p>
          {project.guest_email && <p className="text-amber-700">{project.guest_email}</p>}
          {project.guest_phone && <p className="text-amber-700">{project.guest_phone}</p>}
        </div>
      )}
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{project.progress_percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-blue-600" style={{ width: `${project.progress_percent}%` }} />
        </div>
      </div>

      {linkedQuote && (
        <div className="mb-6 rounded border p-4">
          <h2 className="mb-3 font-semibold">Quote Pricing ({linkedQuote.quote_ref})</h2>
          <QuotePricingTable
            lineItems={(linkedQuote.line_items || []) as { label: string; price: number; recurring?: boolean }[]}
            hourlyItems={(linkedQuote.hourly_items || []) as { label: string; rate: number; unit: string }[]}
            onceOffTotal={linkedQuote.once_off_total}
            monthlyTotal={linkedQuote.monthly_total}
          />
        </div>
      )}

      <div className="mb-8 rounded border-2 border-dashed border-amber-300 bg-amber-50 p-4">
        <h2 className="mb-1 font-semibold text-amber-900">🔒 Internal Notes (never shown to client)</h2>
        <form action={addInternalNote} className="mb-3 mt-2 flex gap-2">
          <input type="hidden" name="project_id" value={project.id} />
          <input
            type="text"
            name="note"
            required
            placeholder="e.g. Client is slow to respond, follow up Friday"
            className="flex-1 rounded border border-amber-300 p-2 text-sm"
          />
          <button type="submit" className="rounded bg-amber-600 px-4 py-2 text-sm text-white">
            Add Note
          </button>
        </form>
        <div className="space-y-2">
          {internalNotes?.map((note) => (
            <div key={note.id} className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm">
              <span>{note.note}</span>
              <span className="text-xs text-gray-400">
                {new Date(note.created_at).toLocaleString('en-ZA')}
              </span>
            </div>
          ))}
        </div>
      </div>

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
        <div>
          <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
          <input
            type="number"
            name="progress_percent"
            min={0}
            max={100}
            defaultValue={project.progress_percent}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Team Contact Name</label>
            <input type="text" name="team_contact_name" defaultValue={project.team_contact_name || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input type="email" name="team_contact_email" defaultValue={project.team_contact_email || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <input type="tel" name="team_contact_phone" defaultValue={project.team_contact_phone || ''} className="mt-1 w-full rounded border border-gray-300 p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Features for this project</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="show_timeline" defaultChecked={project.show_timeline} />
              Show Timeline
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="show_changelog" defaultChecked={project.show_changelog} />
              Show Changelog
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="show_domain_ssl" defaultChecked={project.show_domain_ssl} />
              Show Domain &amp; SSL
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="show_metrics" defaultChecked={project.show_metrics} />
              Show Performance
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Turn off Timeline/Changelog for simpler engagements. Turn on Domain &amp; SSL for web/ecommerce projects.
          </p>
        </div>

        <div className="rounded border p-3">
          <p className="mb-2 text-sm font-medium text-gray-700">Domain &amp; SSL Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600">Domain Name</label>
              <input type="text" name="domain_name" defaultValue={project.domain_name || ''} placeholder="example.co.za" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Registrar</label>
              <input type="text" name="registrar" defaultValue={project.registrar || ''} placeholder="e.g. Domains.co.za" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Domain Expiry</label>
              <input type="date" name="domain_expiry" defaultValue={project.domain_expiry || ''} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">SSL Provider</label>
              <input type="text" name="ssl_provider" defaultValue={project.ssl_provider || ''} placeholder="e.g. Let's Encrypt" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">SSL Expiry</label>
              <input type="date" name="ssl_expiry" defaultValue={project.ssl_expiry || ''} className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Hosting Provider</label>
              <input type="text" name="hosting_provider" defaultValue={project.hosting_provider || ''} placeholder="e.g. Vercel" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">DNS Provider</label>
              <input type="text" name="dns_provider" defaultValue={project.dns_provider || ''} placeholder="e.g. Cloudflare" className="mt-1 w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" name="auto_renew" defaultChecked={project.auto_renew} />
                Auto-renew enabled
              </label>
            </div>
          </div>
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

            {project.show_changelog && (
        <>
      <h2 className="mb-3 mt-8 font-semibold">Changelog</h2>
      <form action={addChangelogEntry} className="mb-4 flex gap-2 rounded border p-4">
        <input type="hidden" name="project_id" value={project.id} />
        <input
          type="text"
          name="note"
          required
          placeholder="e.g. Fixed login bug, deployed to staging"
          className="flex-1 rounded border border-gray-300 p-2 text-sm"
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          Add Entry
        </button>
      </form>

      <div className="mb-8 space-y-2">
        {changelog?.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{entry.note}</span>
            <span className="text-xs text-gray-400">
              {new Date(entry.created_at).toLocaleString('en-ZA')}
            </span>
          </div>
        ))}
        {changelog?.length === 0 && <p className="text-sm text-gray-500">No changelog entries yet.</p>}
      </div>
      </>
      )}

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

      {project.show_timeline && (
        <>
      <h2 className="mb-3 mt-8 font-semibold">Timeline</h2>
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

      {updates?.length === 0 && <p className="text-gray-500">No updates yet.</p>}
      </>
      )}

      {project.show_metrics && (
        <div className="mb-8 rounded border p-4">
          <h2 className="mb-3 font-semibold">Performance</h2>
          <MetricForm projectId={project.id} />

          <div className="mt-4">
            <MetricsSection metrics={metrics || []} />
          </div>

          {metrics && metrics.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-gray-500">All entries ({metrics.length})</summary>
              <div className="mt-2 space-y-1">
                {[...metrics].reverse().map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded border px-3 py-1.5">
                    <span>{m.period_date} • {m.metric_name}: {m.value}</span>
                    <ConfirmSubmitButton
                      action={deleteMetric}
                      hiddenFields={{ id: m.id, project_id: project.id }}
                      buttonLabel="Delete"
                      confirmTitle="Delete this entry?"
                      confirmMessage="This removes this one figure from the charts."
                    />
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <div className="mb-8 rounded border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Access Credentials</h2>
          <a
            href={`/admin/credentials/new?projectId=${project.id}`}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
          >
            + Add credential
          </a>
        </div>

        <div className="space-y-3">
          {projectCredentials?.map((cred) => (
            <div key={cred.id} className="rounded border p-3 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{cred.system_name}</p>
                  <p className="text-xs text-gray-500">
                    {credentialTypeLabel(cred.type)}
                    {cred.environment ? ` • ${credentialEnvironmentLabel(cred.environment)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {cred.shared_with_client && (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Shared with client</span>
                  )}
                  <a href={`/admin/credentials/${cred.id}/edit`} className="text-xs text-gray-500 hover:text-gray-800">
                    Edit
                  </a>
                </div>
              </div>

              <div className="mt-2 space-y-1 text-gray-600">
                {cred.url && <div><span className="text-gray-400">URL:</span> {cred.url}</div>}
                {cred.username && <div><span className="text-gray-400">Username:</span> {cred.username}</div>}
                {cred.tenant && <div><span className="text-gray-400">Tenant:</span> {cred.tenant}</div>}
                {cred.role_access && <div><span className="text-gray-400">Role:</span> {cred.role_access}</div>}
                {cred.password_encrypted && (
                  <SecretField credentialId={cred.id} field="password" label="Password" />
                )}
                {cred.secret_notes_encrypted && (
                  <SecretField credentialId={cred.id} field="notes" label="Secret notes" />
                )}
              </div>
            </div>
          ))}
        </div>

        {projectCredentials?.length === 0 && (
          <p className="text-sm text-gray-500">No credentials linked to this project yet.</p>
        )}
      </div>  

      <h2 className="mb-3 mt-8 font-semibold">Requests</h2>
      <div className="space-y-2">
        {requests?.map((req) => (
          <div key={req.id} className="rounded border p-3 text-sm">
            <p className="font-medium">{req.title}</p>
            <p className="mt-1 text-gray-600">{req.description}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(req.created_at).toLocaleDateString('en-ZA')}
            </p>
            <form action={updateRequestStatus} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="id" value={req.id} />
              <input type="hidden" name="project_id" value={project.id} />
              <select name="status" defaultValue={req.status} className="rounded border border-gray-300 p-1 text-xs">
                <option value="submitted">Submitted</option>
                <option value="reviewing">Reviewing</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
              </select>
              <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-xs text-white">
                Update
              </button>
            </form>
          </div>
        ))}
        {requests?.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
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
          <DocumentRow
            key={doc.id}
            doc={doc}
            versions={(allVersions || []).filter((v) => v.document_id === doc.id)}
          />
        ))}
      </div>

      {documents?.length === 0 && <p className="text-gray-500">No documents yet.</p>}
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