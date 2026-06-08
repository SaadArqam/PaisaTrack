import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const dayStart = startOfDay(now)
    const dayEnd = endOfDay(now)

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, icon, daily_budget')
      .eq('user_id', user.id)
      .not('daily_budget', 'is', null)

    if (categoriesError) throw categoriesError
    if (!categories || categories.length === 0) return NextResponse.json([])

    const budgetStats = await Promise.all(
      categories.map(async (category) => {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('category_id', category.id)
          .eq('user_id', user.id)
          .gte('date', dayStart.toISOString())
          .lte('date', dayEnd.toISOString())

        const spentToday = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
        const dailyBudget = Number(category.daily_budget)
        const percentageUsed = dailyBudget > 0 ? (spentToday / dailyBudget) * 100 : 0
        const remainingBudget = dailyBudget - spentToday

        let status: 'safe' | 'warning' | 'danger' = 'safe'
        if (percentageUsed >= 100) status = 'danger'
        else if (percentageUsed >= 80) status = 'warning'

        return { categoryId: category.id, categoryName: category.name, categoryIcon: category.icon, dailyBudget, spentToday, remainingBudget, percentageUsed, status }
      })
    )

    return NextResponse.json(budgetStats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
