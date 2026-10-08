'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildInvoiceItems } from '@/lib/invoice-items'

type PricedLineItem = { label: string; price: number; recurring?: boolean }
type PricedHourlyItem = { label: string; rate: number; unit: string }

export async function createProjectFromProduct(data: {
  clientId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  name: string
  status: string
  startDate?: string
  targetDate?: string
  productId: string
  productName: string
  lineItems: PricedLineItem[]
  hourlyItems: PricedHourlyItem[]
  onceOffTotal: number
  monthlyTotal: number
}) {
  const supabase = await createClient()

  let clientName: string
  let clientEmail: string

  if (data.clientId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', data.clientId)
      .single()

    if (!profile) return { error: 'Client not found' }

    clientName = profile.full_name || profile.email || 'Client'
    clientEmail = profile.email || ''
  } else if (data.guestName) {
    clientName = data.guestName
    clientEmail = data.guestEmail || ''
  } else {
    return { error: 'No client specified' }
  }

  // 1. Quote (auto-accepted, since it's being used to start the project directly)
  const quoteRef = `CRO-${Date.now().toString().slice(-8)}`

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      quote_ref: quoteRef,
      product_id: data.productId,
      product_name: data.productName,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: data.guestPhone || null,
      user_id: data.clientId || null,
      line_items: data.lineItems,
      hourly_items: data.hourlyItems,
      once_off_total: data.onceOffTotal,
      monthly_total: data.monthlyTotal,
      accepted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (quoteError || !quote) return { error: quoteError?.message || 'Could not create quote' }

  // 2. Project, linked to that quote
  const project_number = `PRJ-${Date.now().toString().slice(-8)}`

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      client_id: data.clientId || null,
      guest_name: data.clientId ? null : data.guestName,
      guest_email: data.clientId ? null : data.guestEmail || null,
      guest_phone: data.clientId ? null : data.guestPhone || null,
      quote_id: quote.id,
      project_number,
      name: data.name.trim(),
      description: `Created with pricing from quote ${quoteRef}`,
      status: data.status,
      start_date: data.startDate || null,
      target_completion_date: data.targetDate || null,
    })
    .select()
    .single()

  if (projectError || !project) return { error: projectError?.message || 'Could not create project' }

  // 3. Invoice: once-off + first month of monthly + hourly reference rows
  const { items: invoiceItems, total: invoiceTotal } = buildInvoiceItems(
    data.lineItems,
    data.hourlyItems,
    data.name.trim()
  )

  const invoice_number = `INV-${Date.now().toString().slice(-8)}`

  await supabase.from('invoices').insert({
    client_id: data.clientId || null,
    guest_name: data.clientId ? null : data.guestName,
    guest_email: data.clientId ? null : data.guestEmail || null,
    guest_phone: data.clientId ? null : data.guestPhone || null,
    project_id: project.id,
    invoice_number,
    title: `Invoice for ${data.name.trim()}`,
    line_items: invoiceItems,
    total: invoiceTotal,
    source: 'project_conversion',
  })

  revalidatePath('/admin/projects')
  revalidatePath('/admin/invoices')
  revalidatePath('/admin/quotes')

  return { projectId: project.id }
}

export async function uploadProjectDocument(formData: FormData): Promise<void> {
  const supabase = await createClient()

  // Verify the requester is actually an admin before touching storage
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return

  const project_id = formData.get('project_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const file = formData.get('file') as File

  if (!project_id || !name?.trim() || !file || file.size === 0) return

  const admin = createAdminClient()
  const storagePath = `${project_id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await admin.storage
    .from('project-documents')
    .upload(storagePath, file)

  if (uploadError) return

  await admin.from('project_documents').insert({
    project_id,
    name: name.trim(),
    description: description?.trim() || null,
    storage_path: storagePath,
  })

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function createProject(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const client_id = formData.get('client_id') as string
  const guest_name = formData.get('guest_name') as string
  const guest_email = formData.get('guest_email') as string
  const guest_phone = formData.get('guest_phone') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const start_date = formData.get('start_date') as string
  const target_completion_date = formData.get('target_completion_date') as string

  if (!name?.trim()) return
  if (!client_id && !guest_name?.trim()) return

  const project_number = `PRJ-${Date.now().toString().slice(-8)}`

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      client_id: client_id || null,
      guest_name: client_id ? null : guest_name.trim(),
      guest_email: client_id ? null : guest_email?.trim() || null,
      guest_phone: client_id ? null : guest_phone?.trim() || null,
      project_number,
      name: name.trim(),
      description: description?.trim() || null,
      status,
      start_date: start_date || null,
      target_completion_date: target_completion_date || null,
    })
    .select()
    .single()

  if (error || !project) return

  // Auto-generate a placeholder invoice — works for guest projects too
  const invoice_number = `INV-${Date.now().toString().slice(-8)}`
  await supabase.from('invoices').insert({
    client_id: client_id || null,
    guest_name: client_id ? null : guest_name.trim(),
    guest_email: client_id ? null : guest_email?.trim() || null,
    guest_phone: client_id ? null : guest_phone?.trim() || null,
    project_id: project.id,
    invoice_number,
    title: `Invoice for ${name.trim()}`,
    line_items: [{ label: name.trim(), price: 0 }],
    total: 0,
    source: 'external_project',
  })

  revalidatePath('/admin/projects')
  revalidatePath('/admin/invoices')
  redirect('/admin/projects')
}

export async function updateProject(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const progress_percent = formData.get('progress_percent') as string
  const start_date = formData.get('start_date') as string
  const target_completion_date = formData.get('target_completion_date') as string
  const team_contact_name = formData.get('team_contact_name') as string
  const team_contact_email = formData.get('team_contact_email') as string
  const team_contact_phone = formData.get('team_contact_phone') as string
  const show_timeline = formData.get('show_timeline') === 'on'
  const show_changelog = formData.get('show_changelog') === 'on'
  const show_domain_ssl = formData.get('show_domain_ssl') === 'on'
  const domain_name = formData.get('domain_name') as string
  const registrar = formData.get('registrar') as string
  const domain_expiry = formData.get('domain_expiry') as string
  const ssl_provider = formData.get('ssl_provider') as string
  const ssl_expiry = formData.get('ssl_expiry') as string
  const hosting_provider = formData.get('hosting_provider') as string
  const dns_provider = formData.get('dns_provider') as string
  const auto_renew = formData.get('auto_renew') === 'on'

  if (!id || !name?.trim()) return

  await supabase
    .from('projects')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      status,
      progress_percent: Math.min(100, Math.max(0, parseInt(progress_percent) || 0)),
      start_date: start_date || null,
      target_completion_date: target_completion_date || null,
      team_contact_name: team_contact_name?.trim() || null,
      team_contact_email: team_contact_email?.trim() || null,
      team_contact_phone: team_contact_phone?.trim() || null,
      show_timeline,
      show_changelog,
      show_domain_ssl,
      domain_name: domain_name?.trim() || null,
      registrar: registrar?.trim() || null,
      domain_expiry: domain_expiry || null,
      ssl_provider: ssl_provider?.trim() || null,
      ssl_expiry: ssl_expiry || null,
      hosting_provider: hosting_provider?.trim() || null,
      dns_provider: dns_provider?.trim() || null,
      auto_renew,
    })
    .eq('id', id)

  revalidatePath(`/admin/projects/${id}`)
}

export async function deleteProject(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  if (!id) return

  await supabase.from('projects').delete().eq('id', id)

  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function addProjectUpdate(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const project_id = formData.get('project_id') as string
  const note = formData.get('note') as string

  if (!project_id || !note?.trim()) return

  await supabase.from('project_updates').insert({
    project_id,
    note: note.trim(),
  })

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function updateProjectDocument(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id = formData.get('id') as string
  const project_id = formData.get('project_id') as string
  const old_storage_path = formData.get('old_storage_path') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const file = formData.get('file') as File | null

  if (!id || !name?.trim()) return

  const admin = createAdminClient()

  const updates: {
    name: string
    description: string | null
    storage_path?: string
  } = {
    name: name.trim(),
    description: description?.trim() || null,
  }

  if (file && file.size > 0) {
    const newStoragePath = `${project_id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await admin.storage
      .from('project-documents')
      .upload(newStoragePath, file)

    if (uploadError) return

    // Log the OLD file as a version instead of deleting it
    const oldFileName = old_storage_path.split('/').pop()?.replace(/^\d+-/, '') || 'document'
    await admin.from('project_document_versions').insert({
      document_id: id,
      storage_path: old_storage_path,
      file_name: oldFileName,
    })

    updates.storage_path = newStoragePath
  }

  await supabase.from('project_documents').update(updates).eq('id', id)

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function deleteProjectDocument(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id = formData.get('id') as string
  const project_id = formData.get('project_id') as string
  const storage_path = formData.get('storage_path') as string

  if (!id) return

  const admin = createAdminClient()
  await admin.storage.from('project-documents').remove([storage_path])
  await admin.from('project_documents').delete().eq('id', id)

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function addChangelogEntry(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const project_id = formData.get('project_id') as string
  const note = formData.get('note') as string

  if (!project_id || !note?.trim()) return

  await supabase.from('project_changelog').insert({ project_id, note: note.trim() })

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function addInternalNote(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const project_id = formData.get('project_id') as string
  const note = formData.get('note') as string

  if (!project_id || !note?.trim()) return

  await supabase.from('project_internal_notes').insert({ project_id, note: note.trim() })

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function getDocumentVersionUrl(storagePath: string, fileName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('project-documents')
    .createSignedUrl(storagePath, 60, { download: fileName })

  if (error || !data) return { error: 'Could not load file' }
  return { url: data.signedUrl }
}