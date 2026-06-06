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
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground mt-2">Track and manage your spending</p>
      </div>

      <ExpenseManager categories={categories || []} initialExpenses={expenses || []} />
    </div>
  )
}
