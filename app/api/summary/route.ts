import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()

    // Total Credited All Time
    const { data: credits, error: creditsError } = await supabase
      .from('balance_entries')
      .select('amount')
      .eq('type', 'credit')

    if (creditsError) throw creditsError
    const totalCreditedAllTime = credits.reduce((sum, item) => sum + Number(item.amount), 0)

    // Total Debited All Time (from balance_entries)
    const { data: debits, error: debitsError } = await supabase
      .from('balance_entries')
      .select('amount')
      .eq('type', 'debit')

    if (debitsError) throw debitsError
    const totalDebitedAllTime = debits.reduce((sum, item) => sum + Number(item.amount), 0)

    // All expenses
    const { data: allExpenses, error: allExpensesError } = await supabase
      .from('expenses')
      .select('amount, id, date, category:categories(id, name, icon)')

    if (allExpensesError) throw allExpensesError
    
    const totalExpensesAllTime = allExpenses.reduce((sum, item) => sum + Number(item.amount), 0)
    
    // Total Balance = Total Credits - Total Debits - Total Expenses
    const totalBalance = totalCreditedAllTime - totalDebitedAllTime - totalExpensesAllTime

    // Total Spent This Month
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    let totalSpentThisMonth = 0
    let transactionCount = 0
    const categoryTotals: Record<string, { name: string, icon: string, total: number }> = {}

    allExpenses.forEach((expense: any) => {
      const expDate = new Date(expense.date)
      if (expDate >= monthStart && expDate <= monthEnd) {
        const amt = Number(expense.amount)
        totalSpentThisMonth += amt
        transactionCount += 1
        
        const cat = expense.category
        if (cat) {
          if (!categoryTotals[cat.id]) {
            categoryTotals[cat.id] = { name: cat.name, icon: cat.icon, total: 0 }
          }
          categoryTotals[cat.id].total += amt
        }
      }
    })

    const spendingByCategory = Object.values(categoryTotals).sort((a, b) => b.total - a.total)

    return NextResponse.json({
      totalBalance,
      totalCreditedAllTime,
      totalSpentThisMonth,
      transactionCount,
      spendingByCategory
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
