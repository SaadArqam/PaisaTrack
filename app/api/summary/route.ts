import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: credits } = await supabase.from('balance_entries').select('amount').eq('user_id', user.id).eq('type', 'credit')
    const { data: debits } = await supabase.from('balance_entries').select('amount').eq('user_id', user.id).eq('type', 'debit')
    const { data: allExpenses } = await supabase.from('expenses').select('amount, id, date, category:categories(id, name, icon)').eq('user_id', user.id)

    const totalCreditedAllTime = credits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const totalDebitedAllTime = debits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const totalExpensesAllTime = allExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const totalBalance = totalCreditedAllTime - totalDebitedAllTime - totalExpensesAllTime

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    let totalSpentThisMonth = 0
    let transactionCount = 0
    const categoryTotals: Record<string, { name: string, icon: string, total: number }> = {}

    allExpenses?.forEach((expense: any) => {
      const expDate = new Date(expense.date)
      if (expDate >= monthStart && expDate <= monthEnd) {
        const amt = Number(expense.amount)
        totalSpentThisMonth += amt
        transactionCount += 1
        const cat = expense.category
        if (cat) {
          if (!categoryTotals[cat.id]) categoryTotals[cat.id] = { name: cat.name, icon: cat.icon, total: 0 }
          categoryTotals[cat.id].total += amt
        }
      }
    })

    const spendingByCategory = Object.values(categoryTotals).sort((a, b) => b.total - a.total)

    return NextResponse.json({ totalBalance, totalCreditedAllTime, totalSpentThisMonth, transactionCount, spendingByCategory })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
