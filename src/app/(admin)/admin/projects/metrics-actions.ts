'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { findMetricPreset } from '@/lib/metric-presets'

export async function saveMetric(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const project_id = formData.get('project_id') as string
  const metric = formData.get('metric') as string
  const custom_name = formData.get('custom_name') as string
  const custom_unit = formData.get('custom_unit') as string
  const period_date = formData.get('period_date') as string
  const value = parseFloat(formData.get('value') as string)
  const note = formData.get('note') as string

  if (!project_id || !metric || !period_date || Number.isNaN(value)) return

  let metric_name: string
  let unit: string

  if (metric === '__custom__') {
    if (!custom_name?.trim()) return
    metric_name = custom_name.trim()
    unit = ['number', 'currency', 'percent'].includes(custom_unit) ? custom_unit : 'number'
  } else {
    const preset = findMetricPreset(metric)
    if (!preset) return
    metric_name = preset.name
    unit = preset.unit
  }

  // Saving the same metric for the same date again simply updates it
  await supabase.from('project_metrics').upsert(
    { project_id, metric_name, unit, period_date, value, note: note?.trim() || null },
    { onConflict: 'project_id,metric_name,period_date' }
  )

  revalidatePath(`/admin/projects/${project_id}`)
}

export async function deleteMetric(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const project_id = formData.get('project_id') as string
  if (!id) return

  await supabase.from('project_metrics').delete().eq('id', id)

  revalidatePath(`/admin/projects/${project_id}`)
}