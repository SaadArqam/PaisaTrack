import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get today's boundaries in local timezone
    const now = new Date()
    const dayStart = startOfDay(now)
    const dayEnd = endOfDay(now)

    // Fetch all categories with daily_budget set
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, icon, daily_budget')
      .not('daily_budget', 'is', null)

    if (categoriesError) throw categoriesError

    if (!categories || categories.length === 0) {
      return NextResponse.json([])
    }

    // For each category, calculate expenses today
    const budgetStats = await Promise.all(
      categories.map(async (category) => {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('category_id', category.id)
          .gte('date', dayStart.toISOString())
          .lte('date', dayEnd.toISOString())

        const spentToday = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
        const dailyBudget = Number(category.daily_budget)
        
        // Avoid division by zero
        const percentageUsed = dailyBudget > 0 ? (spentToday / dailyBudget) * 100 : 0
        const remainingBudget = dailyBudget - spentToday

        // Determine status
        let status: 'safe' | 'warning' | 'danger' = 'safe'
        if (percentageUsed >= 100) {
          status = 'danger'
        } else if (percentageUsed >= 80) {
          status = 'warning'
        }

        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryIcon: category.icon,
          dailyBudget,
          spentToday,
          remainingBudget,
          percentageUsed,
          status
        }
      })
    )

    return NextResponse.json(budgetStats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
