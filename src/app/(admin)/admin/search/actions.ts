'use server'

import { createClient } from '@/lib/supabase/server'

export async function globalSearch(query: string) {
  const supabase = await createClient()
  const q = `%${query}%`

  const [projects, invoices, quotes, tickets] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, project_number, profiles(full_name, email)')
      .or(`name.ilike.${q},project_number.ilike.${q}`)
      .limit(10),
    supabase
      .from('invoices')
      .select('id, title, invoice_number, profiles(full_name, email)')
      .or(`title.ilike.${q},invoice_number.ilike.${q}`)
      .limit(10),
    supabase
      .from('quotes')
      .select('id, product_name, quote_ref, client_name')
      .or(`product_name.ilike.${q},quote_ref.ilike.${q},client_name.ilike.${q}`)
      .limit(10),
    supabase
      .from('support_tickets')
      .select('id, subject, profiles(full_name, email)')
      .ilike('subject', q)
      .limit(10),
  ])

  return {
    projects: projects.data || [],
    invoices: invoices.data || [],
    quotes: quotes.data || [],
    tickets: tickets.data || [],
  }
}