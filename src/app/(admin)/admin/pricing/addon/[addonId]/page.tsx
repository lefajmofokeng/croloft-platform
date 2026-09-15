import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AddonPage({
  params,
}: {
  params: Promise<{ addonId: string }>
}) {
  const { addonId } = await params
  const supabase = await createClient()

  const { data: addon } = await supabase
    .from('pricing_addons')
    .select('*')
    .eq('id', addonId)
    .single()

  if (!addon) {
    notFound()
  }

  const { data: options } = await supabase
    .from('pricing_addon_options')
    .select('*')
    .eq('addon_id', addonId)
    .order('display_order', { ascending: true })

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{addon.name} — Options</h1>
        <Link href={`/admin/pricing/addon/${addonId}/new`} className="rounded bg-blue-600 px-4 py-2 text-white">
          + Add Option
        </Link>
      </div>

      <ul className="space-y-2">
        {options?.map((option) => (
          <li key={option.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">
                {option.label} {option.is_default && <span className="ml-1 text-xs text-green-600">(default)</span>}
              </p>
              <p className="text-sm text-gray-500">R{option.price}</p>
            </div>
            <Link href={`/admin/pricing/addon-option/${option.id}/edit`} className="text-sm text-gray-500 hover:text-gray-800">
              Edit
            </Link>
          </li>
        ))}
      </ul>

      {options?.length === 0 && <p className="text-gray-500">No options yet.</p>}
    </div>
  )
}