'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function recalculateProductPricing(productId: string) {
  const supabase = await createClient()

  const { data: includedAddons } = await supabase
    .from('pricing_addons')
    .select('unit_price, billing_cycle')
    .eq('product_id', productId)
    .eq('type', 'included')

  const base_price = (includedAddons || [])
    .filter((a) => a.billing_cycle === 'once_off')
    .reduce((sum, a) => sum + Number(a.unit_price || 0), 0)

  const monthly_price = (includedAddons || [])
    .filter((a) => a.billing_cycle === 'monthly')
    .reduce((sum, a) => sum + Number(a.unit_price || 0), 0)

  await supabase
    .from('pricing_products')
    .update({ base_price, monthly_price })
    .eq('id', productId)
}
export async function createCategory(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name?.trim()) {
    return
  }

  await supabase
    .from('pricing_categories')
    .insert({ name: name.trim(), description: description?.trim() || null })

  revalidatePath('/admin/pricing')
}

export async function createProduct(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const category_id = formData.get('category_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const base_price = '0'
  const monthly_price = '0'
  
  if (!name?.trim() || !category_id) {
    return
  }

  await supabase.from('pricing_products').insert({
    category_id,
    name: name.trim(),
    description: description?.trim() || null,
    base_price: parseFloat(base_price) || 0,
    monthly_price: parseFloat(monthly_price) || 0,
  })

  revalidatePath(`/admin/pricing/${category_id}`)
}

export async function createAddon(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const product_id = formData.get('product_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const billing_cycle = formData.get('billing_cycle') as string
  const unit_price = formData.get('unit_price') as string
  const unit_label = formData.get('unit_label') as string
  const included_quantity = formData.get('included_quantity') as string

  if (!name?.trim() || !product_id || !type) {
    return
  }

  await supabase.from('pricing_addons').insert({
    product_id,
    name: name.trim(),
    type,
    billing_cycle: billing_cycle || 'once_off',
    unit_price: type === 'numeric' || type === 'included' ? parseFloat(unit_price) || 0 : null,
    unit_label: type === 'numeric' ? unit_label?.trim() || null : null,
    included_quantity: type === 'numeric' ? parseInt(included_quantity) || 0 : 0,
  })

  if (type === 'included') {
    await recalculateProductPricing(product_id)
  }

  revalidatePath(`/admin/pricing/product/${product_id}`)
}
export async function createAddonOption(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const addon_id = formData.get('addon_id') as string
  const label = formData.get('label') as string
  const price = formData.get('price') as string
  const is_default = formData.get('is_default') === 'on'

  if (!label?.trim() || !addon_id) {
    return
  }

  // If this one is being set as default, clear any existing default on this addon first
  if (is_default) {
    await supabase.from('pricing_addon_options').update({ is_default: false }).eq('addon_id', addon_id)
  }

  await supabase.from('pricing_addon_options').insert({
    addon_id,
    label: label.trim(),
    price: parseFloat(price) || 0,
    is_default,
  })

  revalidatePath(`/admin/pricing/addon/${addon_id}`)
}

export async function updateCategory(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!id || !name?.trim()) {
    return
  }

  await supabase
    .from('pricing_categories')
    .update({ name: name.trim(), description: description?.trim() || null })
    .eq('id', id)

  revalidatePath('/admin/pricing')
  redirect('/admin/pricing')
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  await supabase.from('pricing_categories').delete().eq('id', id)

  revalidatePath('/admin/pricing')
  redirect('/admin/pricing')
}

export async function updateProduct(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const category_id = formData.get('category_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  // base_price and monthly_price are no longer editable here — they're
  // computed automatically from "Included" add-ons, so we simply don't touch them
  
  if (!id || !name?.trim()) {
    return
  }

  await supabase
    .from('pricing_products')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .eq('id', id)

  revalidatePath(`/admin/pricing/${category_id}`)
  redirect(`/admin/pricing/${category_id}`)
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const category_id = formData.get('category_id') as string

  if (!id) return

  await supabase.from('pricing_products').delete().eq('id', id)

  revalidatePath(`/admin/pricing/${category_id}`)
  redirect(`/admin/pricing/${category_id}`)
}

export async function updateAddon(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const product_id = formData.get('product_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const billing_cycle = formData.get('billing_cycle') as string
  const unit_price = formData.get('unit_price') as string
  const unit_label = formData.get('unit_label') as string
  const included_quantity = formData.get('included_quantity') as string

  if (!id || !name?.trim() || !type) {
    return
  }

  await supabase
    .from('pricing_addons')
    .update({
      name: name.trim(),
      type,
      billing_cycle: billing_cycle || 'once_off',
      unit_price: type === 'numeric' || type === 'included' ? parseFloat(unit_price) || 0 : null,
      unit_label: type === 'numeric' ? unit_label?.trim() || null : null,
      included_quantity: type === 'numeric' ? parseInt(included_quantity) || 0 : 0,
    })
    .eq('id', id)

  // Recalculate regardless of current type — covers the case where it WAS
  // included and just got changed to something else, or vice versa
  await recalculateProductPricing(product_id)

  revalidatePath(`/admin/pricing/product/${product_id}`)
  redirect(`/admin/pricing/product/${product_id}`)
}

export async function deleteAddon(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const product_id = formData.get('product_id') as string

  if (!id) return

  await supabase.from('pricing_addons').delete().eq('id', id)
  await recalculateProductPricing(product_id)

  revalidatePath(`/admin/pricing/product/${product_id}`)
  redirect(`/admin/pricing/product/${product_id}`)
}

export async function updateAddonOption(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const addon_id = formData.get('addon_id') as string
  const label = formData.get('label') as string
  const price = formData.get('price') as string
  const is_default = formData.get('is_default') === 'on'

  if (!id || !label?.trim()) {
    return
  }

  if (is_default) {
    await supabase.from('pricing_addon_options').update({ is_default: false }).eq('addon_id', addon_id).neq('id', id)
  }

  await supabase
    .from('pricing_addon_options')
    .update({ label: label.trim(), price: parseFloat(price) || 0, is_default })
    .eq('id', id)

  revalidatePath(`/admin/pricing/addon/${addon_id}`)
  redirect(`/admin/pricing/addon/${addon_id}`)
}

export async function deleteAddonOption(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const addon_id = formData.get('addon_id') as string

  if (!id) return

  await supabase.from('pricing_addon_options').delete().eq('id', id)

  revalidatePath(`/admin/pricing/addon/${addon_id}`)
  redirect(`/admin/pricing/addon/${addon_id}`)
}