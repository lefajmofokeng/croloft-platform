'use server'

import { createClient } from '@/lib/supabase/server'

type LineItem = { label: string; price: number; recurring?: boolean }

export async function saveQuote(data: {
  productId: string
  productName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  lineItems: LineItem[]
  onceOffTotal: number
  monthlyTotal: number
  userId?: string | null
}) {
  const supabase = await createClient()

  const quoteRef = `CRO-${Date.now().toString().slice(-8)}`

  const { error } = await supabase.from('quotes').insert({
    quote_ref: quoteRef,
    product_id: data.productId,
    product_name: data.productName,
    client_name: data.clientName.trim(),
    client_email: data.clientEmail.trim(),
    client_phone: data.clientPhone?.trim() || null,
    line_items: data.lineItems,
    once_off_total: data.onceOffTotal,
    monthly_total: data.monthlyTotal,
    user_id: data.userId || null,
  })

  if (error) {
    return { error: error.message }
  }

  return { quoteRef }
}

export async function getCurrentClientProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return profile ? { userId: user.id, fullName: profile.full_name, email: profile.email } : null
}

export async function loginForQuote(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: error?.message || 'Login failed' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', data.user.id)
    .single()

  return { userId: data.user.id, fullName: profile?.full_name, email: profile?.email }
}