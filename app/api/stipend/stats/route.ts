import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get stipend config for this user
    const { data: config, error: configError } = await supabase
      .from('stipend_config')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (configError) throw configError

    if (!config) {
      return NextResponse.json({
        stipendAmount: null, creditDay: null, daysUntilNextStipend: null,
        daysElapsed: null, totalDaysInCycle: null, amountSpentThisCycle: null,
        balanceLeft: null, safeSpendPerDay: null, actualSpendPerDay: null,
        projectedBalanceOnPayday: null, isOverspending: null, willRunOut: null
      })
    }

    const now = new Date()
    const currentDay = now.getDate()
    const creditDay = config.credit_day

    let daysUntilNextStipend = creditDay - currentDay
    if (daysUntilNextStipend <= 0) daysUntilNextStipend = 30 + daysUntilNextStipend
    if (currentDay === creditDay) daysUntilNextStipend = 30

    let lastStipendDate = new Date(now)
    lastStipendDate.setDate(currentDay - creditDay)
    if (lastStipendDate > now) lastStipendDate.setMonth(lastStipendDate.getMonth() - 1)

    const daysElapsed = Math.floor((now.getTime() - lastStipendDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalDaysInCycle = daysElapsed + daysUntilNextStipend

    const { data: credits } = await supabase.from('balance_entries').select('amount').eq('user_id', user.id).eq('type', 'credit')
    const { data: debits } = await supabase.from('balance_entries').select('amount').eq('user_id', user.id).eq('type', 'debit')

    const totalCredited = credits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const totalDebited = debits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    const { data: cycleExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', lastStipendDate.toISOString())

    const amountSpentThisCycle = cycleExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const balanceLeft = totalCredited - totalDebited - amountSpentThisCycle
    const safeSpendPerDay = daysUntilNextStipend > 0 ? balanceLeft / daysUntilNextStipend : 0
    const actualSpendPerDay = daysElapsed > 0 ? amountSpentThisCycle / daysElapsed : 0
    const projectedBalanceOnPayday = balanceLeft - (actualSpendPerDay * daysUntilNextStipend)
    const isOverspending = actualSpendPerDay > safeSpendPerDay
    const willRunOut = projectedBalanceOnPayday < 0

    return NextResponse.json({
      stipendAmount: Number(config.amount), creditDay: config.credit_day,
      daysUntilNextStipend, daysElapsed, totalDaysInCycle, amountSpentThisCycle,
      balanceLeft, safeSpendPerDay, actualSpendPerDay, projectedBalanceOnPayday,
      isOverspending, willRunOut
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
