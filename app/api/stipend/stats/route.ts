import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get stipend config
    const { data: config, error: configError } = await supabase
      .from('stipend_config')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (configError) throw configError

    // If no config exists, return null for all fields
    if (!config) {
      return NextResponse.json({
        stipendAmount: null,
        creditDay: null,
        daysUntilNextStipend: null,
        daysElapsed: null,
        totalDaysInCycle: null,
        amountSpentThisCycle: null,
        balanceLeft: null,
        safeSpendPerDay: null,
        actualSpendPerDay: null,
        projectedBalanceOnPayday: null,
        isOverspending: null,
        willRunOut: null
      })
    }

    const now = new Date()
    const currentDay = now.getDate()
    const creditDay = config.credit_day

    // Calculate days until next stipend
    let daysUntilNextStipend = creditDay - currentDay
    if (daysUntilNextStipend <= 0) {
      daysUntilNextStipend = 30 + daysUntilNextStipend
    }

    // Handle edge case: if today IS the credit_day, reset cycle to 30 days
    if (currentDay === creditDay) {
      daysUntilNextStipend = 30
    }

    // Calculate last stipend date
    let lastStipendDate = new Date(now)
    lastStipendDate.setDate(currentDay - creditDay)
    if (lastStipendDate > now) {
      lastStipendDate.setMonth(lastStipendDate.getMonth() - 1)
    }

    // Calculate days elapsed since last stipend
    const daysElapsed = Math.floor((now.getTime() - lastStipendDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalDaysInCycle = daysElapsed + daysUntilNextStipend

    // Get total balance from balance_entries
    const { data: credits } = await supabase.from('balance_entries').select('amount').eq('type', 'credit')
    const { data: debits } = await supabase.from('balance_entries').select('amount').eq('type', 'debit')
    
    const totalCredited = credits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const totalDebited = debits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    // Get expenses since last stipend date
    const { data: cycleExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .gte('date', lastStipendDate.toISOString())

    const amountSpentThisCycle = cycleExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    // Calculate balance left
    const balanceLeft = totalCredited - totalDebited - amountSpentThisCycle

    // Calculate safe spend per day
    const safeSpendPerDay = daysUntilNextStipend > 0 ? balanceLeft / daysUntilNextStipend : 0

    // Calculate actual spend per day (avoid division by zero)
    const actualSpendPerDay = daysElapsed > 0 ? amountSpentThisCycle / daysElapsed : 0

    // Calculate projected balance on payday
    const projectedBalanceOnPayday = balanceLeft - (actualSpendPerDay * daysUntilNextStipend)

    // Determine overspending and will run out
    const isOverspending = actualSpendPerDay > safeSpendPerDay
    const willRunOut = projectedBalanceOnPayday < 0

    return NextResponse.json({
      stipendAmount: Number(config.amount),
      creditDay: config.credit_day,
      daysUntilNextStipend,
      daysElapsed,
      totalDaysInCycle,
      amountSpentThisCycle,
      balanceLeft,
      safeSpendPerDay,
      actualSpendPerDay,
      projectedBalanceOnPayday,
      isOverspending,
      willRunOut
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
