import { createClient } from '@/lib/supabase-server'
import { ExpenseManager } from '@/components/ExpenseManager'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .order('date', { ascending: false })

  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <ExpenseManager categories={categories || []} initialExpenses={expenses || []} />
    </div>
  )
}


