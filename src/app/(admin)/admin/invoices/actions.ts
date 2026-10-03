'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type LineItem = { label: string; price: number }

export async function createInvoice(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const client_id = formData.get('client_id') as string
  const project_id = formData.get('project_id') as string
  const title = formData.get('title') as string
  const due_date = formData.get('due_date') as string
  const labels = formData.getAll('item_label') as string[]
  const prices = formData.getAll('item_price') as string[]

  if (!client_id || !title?.trim()) return

  const line_items: LineItem[] = labels
    .map((label, i) => ({ label: label.trim(), price: parseFloat(prices[i]) || 0 }))
    .filter((item) => item.label.length > 0)

  if (line_items.length === 0) return

  const total = line_items.reduce((sum, item) => sum + item.price, 0)
  const invoice_number = `INV-${Date.now().toString().slice(-8)}`

  await supabase.from('invoices').insert({
    client_id,
    project_id: project_id || null,
    invoice_number,
    title: title.trim(),
    line_items,
    total,
    due_date: due_date || null,
  })

  revalidatePath('/admin/invoices')
  redirect('/admin/invoices')
}

export async function updateInvoiceStatus(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!id || !status) return

  await supabase.from('invoices').update({ status }).eq('id', id)

  revalidatePath(`/admin/invoices/${id}`)
}

export async function deleteInvoice(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  if (!id) return

  await supabase.from('invoices').delete().eq('id', id)

  revalidatePath('/admin/invoices')
  redirect('/admin/invoices')
}

type InvoiceLineItem = { label: string; price: number }

export async function updateInvoiceDetails(data: {
  invoiceId: string
  title: string
  dueDate: string
  lineItems: InvoiceLineItem[]
}) {
  const supabase = await createClient()

  if (!data.title?.trim() || data.lineItems.length === 0) {
    return { error: 'Title and at least one line item are required' }
  }

  const total = data.lineItems.reduce((sum, item) => sum + item.price, 0)

  const { error } = await supabase
    .from('invoices')
    .update({
      title: data.title.trim(),
      due_date: data.dueDate || null,
      line_items: data.lineItems,
      total,
    })
    .eq('id', data.invoiceId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/invoices/${data.invoiceId}`)
  return { success: true }
}