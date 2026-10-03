'use server'

import { createClient } from '@/lib/supabase/server'

type ProjectResult = { id: string; name: string; project_number: string }
type InvoiceResult = { id: string; title: string; invoice_number: string }
type QuoteResult = { id: string; product_name: string; quote_ref: string }
type TicketResult = { id: string; subject: string }

export async function portalSearch(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { projects: [], invoices: [], quotes: [], tickets: [] }

  const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
  const q = `%${query}%`

  const [projects, invoices, quotes, tickets] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, project_number')
      .eq('client_id', user.id)
      .or(`name.ilike.${q},project_number.ilike.${q}`)
      .limit(10),
    supabase
      .from('invoices')
      .select('id, title, invoice_number')
      .eq('client_id', user.id)
      .or(`title.ilike.${q},invoice_number.ilike.${q}`)
      .limit(10),
    supabase
      .from('quotes')
      .select('id, product_name, quote_ref')
      .or(`user_id.eq.${user.id},client_email.eq.${profile?.email}`)
      .or(`product_name.ilike.${q},quote_ref.ilike.${q}`)
      .limit(10),
    supabase
      .from('support_tickets')
      .select('id, subject')
      .eq('client_id', user.id)
      .ilike('subject', q)
      .limit(10),
  ])

  return {
    projects: (projects.data || []) as unknown as ProjectResult[],
    invoices: (invoices.data || []) as unknown as InvoiceResult[],
    quotes: (quotes.data || []) as unknown as QuoteResult[],
    tickets: (tickets.data || []) as unknown as TicketResult[],
  }
}