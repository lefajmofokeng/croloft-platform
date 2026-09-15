import { createClient } from '@/lib/supabase/server'
import InvoiceForm from '../invoice-form'

export default async function NewInvoicePage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_id')
    .order('name')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Create Invoice</h1>
      <InvoiceForm clients={clients || []} projects={projects || []} />
    </div>
  )
}