'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildInvoiceItems } from '@/lib/invoice-items'

export async function convertQuoteToProject(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const quote_id = formData.get('quote_id') as string
  const client_id = formData.get('client_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!quote_id || !client_id || !name?.trim()) return

  const { data: quote } = await supabase
    .from('quotes')
    .select('line_items, hourly_items')
    .eq('id', quote_id)
    .single()

  const project_number = `PRJ-${Date.now().toString().slice(-8)}`

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      client_id,
      quote_id,
      project_number,
      name: name.trim(),
      description: description?.trim() || null,
      status: 'planning',
    })
    .select()
    .single()

  if (error || !project) return

  if (quote) {
    const { items, total } = buildInvoiceItems(
      (quote.line_items || []) as { label: string; price: number; recurring?: boolean }[],
      (quote.hourly_items || []) as { label: string; rate: number; unit: string }[],
      name.trim()
    )

    const invoice_number = `INV-${Date.now().toString().slice(-8)}`
    await supabase.from('invoices').insert({
      client_id,
      project_id: project.id,
      invoice_number,
      title: `Invoice for ${name.trim()}`,
      line_items: items,
      total,
      source: 'project_conversion',
    })
  }

  revalidatePath('/admin/projects')
  revalidatePath('/admin/invoices')
  redirect(`/admin/projects/${project.id}`)
}

type LineItem = { label: string; price: number; recurring?: boolean }

type HourlyItem = { label: string; rate: number; unit: string }

export async function adminCreateQuote(data: {
  clientId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  productId: string
  productName: string
  lineItems: LineItem[]
  hourlyItems: HourlyItem[]
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
  } else if (data.guestName && data.guestEmail) {
    clientName = data.guestName
    clientEmail = data.guestEmail
  } else {
    return { error: 'No client specified' }
  }

  const quoteRef = `CRO-${Date.now().toString().slice(-8)}`

  const { error } = await supabase.from('quotes').insert({
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
  })

  if (error) return { error: error.message }

  return { quoteRef }
}