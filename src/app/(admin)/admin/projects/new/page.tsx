import { createClient } from '@/lib/supabase/server'
import NewProjectForm from './new-project-form'

export default async function NewProjectPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  const { data: categories } = await supabase
    .from('pricing_categories')
    .select('*, pricing_products(*)')
    .order('display_order', { ascending: true })

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Assign Project</h1>
      <NewProjectForm clients={clients || []} categories={categories || []} />
    </div>
  )
}