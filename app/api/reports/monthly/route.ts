import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const { data, error } = await supabase
    .from('expenses')
    .select('date, amount, category_id, categories(name, icon)')
    .eq('user_id', user.id)
    .gte('date', sixMonthsAgo.toISOString())

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Group by month
  const monthly: Record<string, number> = {}
  data?.forEach(e => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly[key] = (monthly[key] || 0) + Number(e.amount)
  })

  // Group by category for current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  const categorySpend: Record<string, { name: string; icon: string; amount: number }> = {}
  data?.filter(e => new Date(e.date).toISOString().slice(0, 7) === currentMonth)
    .forEach((e: any) => {
      const catName = e.categories?.name || 'Other'
      const catIcon = e.categories?.icon || '💰'
      if (!categorySpend[catName]) {
        categorySpend[catName] = { name: catName, icon: catIcon, amount: 0 }
      }
      categorySpend[catName].amount += Number(e.amount)
    })

  const monthlyArray = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      amount: Math.round(amount)
    }))

  const categoryArray = Object.values(categorySpend)
    .sort((a, b) => b.amount - a.amount)

  return Response.json({ monthly: monthlyArray, categories: categoryArray })
}
