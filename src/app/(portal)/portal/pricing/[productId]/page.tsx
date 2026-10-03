import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PortalPricingCalculator from './portal-pricing-calculator'

export default async function PortalProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('pricing_products')
    .select('*, pricing_addons(*, pricing_addon_options(*))')
    .eq('id', productId)
    .single()

  if (!product) {
    notFound()
  }

  return <PortalPricingCalculator product={product} />
}