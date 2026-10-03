'use server'

import { createClient } from '@/lib/supabase/server'

type LineItem = { label: string; price: number; recurring?: boolean }

export async function generatePortalQuote(data: {
  productId: string
  productName: string
  lineItems: LineItem[]
  onceOffTotal: number
  monthlyTotal: number
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  const quoteRef = `CRO-${Date.now().toString().slice(-8)}`

  const { error } = await supabase.from('quotes').insert({
    quote_ref: quoteRef,
    product_id: data.productId,
    product_name: data.productName,
    client_name: profile.full_name || profile.email,
    client_email: profile.email,
    line_items: data.lineItems,
    once_off_total: data.onceOffTotal,
    monthly_total: data.monthlyTotal,
    user_id: user.id,
  })

  if (error) return { error: error.message }

  return { quoteRef, clientName: profile.full_name || profile.email, clientEmail: profile.email }
}