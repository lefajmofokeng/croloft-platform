import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminQuoteCalculator from './admin-quote-calculator'

export default async function AdminQuoteConfigPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ clientId?: string; guestName?: string; guestEmail?: string; guestPhone?: string }>
}) {
  const { productId } = await params
  const { clientId, guestName, guestEmail, guestPhone } = await searchParams

  if (!clientId && !(guestName && guestEmail)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: product } = await supabase
    .from('pricing_products')
    .select('*, pricing_addons(*, pricing_addon_options(*))')
    .eq('id', productId)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <AdminQuoteCalculator
      product={product}
      clientId={clientId}
      guestName={guestName}
      guestEmail={guestEmail}
      guestPhone={guestPhone}
    />
  )
}