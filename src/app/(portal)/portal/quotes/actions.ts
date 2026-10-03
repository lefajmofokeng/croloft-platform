'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptQuote(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const quote_id = formData.get('quote_id') as string
  if (!quote_id) return

  await supabase
    .from('quotes')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', quote_id)

  revalidatePath(`/portal/quotes/${quote_id}`)
}