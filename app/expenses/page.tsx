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
    <div className="p-6 md:p-10 space-y-10 max-w-7xl">
      <div>
        <h1 className="swiss-page-heading border-b-4 border-[#FF3000] inline-block pb-2">
          EXPENSES
        </h1>
      </div>

      <ExpenseManager categories={categories || []} initialExpenses={expenses || []} />
    </div>
  )
}
