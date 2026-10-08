import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DocumentDownloadButton from '../document-download-button'
import PrintSummaryButton from './print-summary-button'
import DocumentVersionHistory from '@/components/document-version-history'
import { getClientDocumentVersionUrl } from '../actions'
import ExpiryBadge from '@/components/expiry-badge'

type LineItem = { label: string; price: number; recurring?: boolean }
type HourlyItem = { label: string; rate: number; unit: string }

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

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

  return (
    <div className="p-8 max-w-2xl">
      <a href="/portal" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to dashboard
      </a>

      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
          {statusLabels[project.status]}
        </span>
      </div>
      <p className="mb-2 text-sm text-gray-400">{project.project_number}</p>
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{project.progress_percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-blue-600" style={{ width: `${project.progress_percent}%` }} />
        </div>
      </div>

            {project.show_domain_ssl && (
        <div className="mb-6 rounded border p-4">
          <h2 className="mb-3 font-semibold">Domain &amp; SSL</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {project.domain_name && (
              <div><span className="text-gray-500">Domain:</span> {project.domain_name}</div>
            )}
            {project.registrar && (
              <div><span className="text-gray-500">Registrar:</span> {project.registrar}</div>
            )}
            {project.domain_expiry && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Domain Expiry:</span> {project.domain_expiry}
                <ExpiryBadge date={project.domain_expiry} />
              </div>
            )}
            {project.ssl_provider && (
              <div><span className="text-gray-500">SSL Provider:</span> {project.ssl_provider}</div>
            )}
            {project.ssl_expiry && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">SSL Expiry:</span> {project.ssl_expiry}
                <ExpiryBadge date={project.ssl_expiry} />
              </div>
            )}
            {project.hosting_provider && (
              <div><span className="text-gray-500">Hosting:</span> {project.hosting_provider}</div>
            )}
            {project.dns_provider && (
              <div><span className="text-gray-500">DNS:</span> {project.dns_provider}</div>
            )}
            <div><span className="text-gray-500">Auto-renew:</span> {project.auto_renew ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      {linkedQuote && (
        <div className="mb-6 rounded border p-4">
          <h2 className="mb-3 font-semibold">Quote Pricing ({linkedQuote.quote_ref})</h2>
          {(() => {
            const lineItems = linkedQuote.line_items as LineItem[]
            const hourlyItems = (linkedQuote.hourly_items || []) as HourlyItem[]
            const onceOffItems = lineItems.filter((i) => !i.recurring)
            const monthlyItems = lineItems.filter((i) => i.recurring)
          
            return (
              <div className="space-y-3">
                {onceOffItems.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Once-off</p>
                    {onceOffItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.label}</span><span>R{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {monthlyItems.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Monthly</p>
                    {monthlyItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.label}</span><span>R{item.price.toFixed(2)}/mo</span>
                      </div>
                    ))}
                  </div>
                )}
                {hourlyItems.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Hourly</p>
                    {hourlyItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.label} ({item.unit})</span><span>R{item.rate.toFixed(2)}/hr</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Once-off total</span><span>R{linkedQuote.once_off_total}</span>
                </div>
                {linkedQuote.monthly_total > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>Monthly total</span><span>R{linkedQuote.monthly_total}/mo</span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {project.team_contact_name && (
        <div className="mb-6 rounded border bg-gray-50 p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Your Project Lead</p>
          <p className="font-medium">{project.team_contact_name}</p>
          {project.team_contact_email && <p className="text-sm text-gray-600">{project.team_contact_email}</p>}
          {project.team_contact_phone && <p className="text-sm text-gray-600">{project.team_contact_phone}</p>}
        </div>
      )}

      {project.description && <p className="mb-4 text-gray-500">{project.description}</p>}

      <div className="mb-6 flex gap-6 text-sm text-gray-500">
        {project.start_date && <span>Started: {project.start_date}</span>}
        {project.target_completion_date && <span>Target: {project.target_completion_date}</span>}
      </div>

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

      {project.show_changelog && (
        <>
      <h2 className="mb-3 mt-8 font-semibold">Changelog</h2>
      <div className="space-y-2">
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

      <PrintSummaryButton
        projectName={project.name}
        projectNumber={project.project_number}
        status={project.status}
        progressPercent={project.progress_percent}
        description={project.description}
        startDate={project.start_date}
        targetDate={project.target_completion_date}
        teamContactName={project.team_contact_name}
        teamContactEmail={project.team_contact_email}
        teamContactPhone={project.team_contact_phone}
        updates={updates || []}
        changelog={changelog || []}
        showTimeline={project.show_timeline}
        showChangelog={project.show_changelog}
        documents={(documents || []).map((d) => ({ name: d.name, description: d.description }))}
      />
    
      <h2 className="mb-3 mt-8 font-semibold">Documents</h2>
      <div className="space-y-2">
        {documents?.map((doc) => (
          <div key={doc.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{doc.name}</p>
                {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
              </div>
              <DocumentDownloadButton documentId={doc.id} />
            </div>
            <DocumentVersionHistory
              versions={(allVersions || []).filter((v) => v.document_id === doc.id)}
              getUrl={getClientDocumentVersionUrl}
            />
          </div>
        ))}
      </div>

      {documents?.length === 0 && <p className="text-gray-500">No documents yet.</p>}
    
    </div>
  )
}