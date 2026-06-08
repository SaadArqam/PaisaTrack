import { createClient } from '@/lib/supabase-server'
import RecurringClient from '@/components/RecurringClient'

export const dynamic = 'force-dynamic'

export default async function RecurringPage() {
  const supabase = await createClient()

  const { data: recurring } = await supabase
    .from('recurring_expenses')
    .select(`
      *,
      categories(name, icon)
    `)
    .eq('is_active', true)
    .order('next_due_date', { ascending: true })

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Recurring</h1>
        <p className="text-muted-foreground mt-2">Manage your recurring payments</p>
      </div>

      <RecurringClient initialData={recurring || []} />
    </div>
  )
}
