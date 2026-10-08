import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectPricingCalculator from './project-pricing-calculator'

export default async function NewProjectPricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{
    clientId?: string
    guestName?: string
    guestEmail?: string
    guestPhone?: string
    name?: string
    status?: string
    start_date?: string
    target_completion_date?: string
  }>
}) {
  const { productId } = await params
  const sp = await searchParams

  if (!sp.name || (!sp.clientId && !sp.guestName)) {
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
    <ProjectPricingCalculator
      product={product}
      clientId={sp.clientId}
      guestName={sp.guestName}
      guestEmail={sp.guestEmail}
      guestPhone={sp.guestPhone}
      projectName={sp.name}
      status={sp.status || 'planning'}
      startDate={sp.start_date}
      targetDate={sp.target_completion_date}
    />
  )
}