'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface StipendStats {
  stipendAmount: number | null
  creditDay: number | null
  daysUntilNextStipend: number | null
  daysElapsed: number | null
  totalDaysInCycle: number | null
  amountSpentThisCycle: number | null
  balanceLeft: number | null
  safeSpendPerDay: number | null
  actualSpendPerDay: number | null
  projectedBalanceOnPayday: number | null
  isOverspending: boolean | null
  willRunOut: boolean | null
}

export function StipendWidget() {
  const [stats, setStats] = useState<StipendStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stipend/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stipend stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '₹0'
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-2 border-black bg-white p-6 h-32 animate-pulse bg-[#F2F2F2]" />
        ))}
      </div>
    )
  }

  if (!stats || stats.stipendAmount === null) {
    return (
      <div className="border-2 border-black bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs uppercase tracking-widest font-bold flex-1">
          Set up your stipend in Settings to unlock spending insights
        </p>
        <Link href="/settings">
          <Button>Configure</Button>
        </Link>
      </div>
    )
  }

  const progressPercent = stats.totalDaysInCycle && stats.daysElapsed !== null
    ? Math.round((stats.daysElapsed / stats.totalDaysInCycle) * 100)
    : 0

  const isOverSafeLimit = stats.actualSpendPerDay && stats.safeSpendPerDay && stats.actualSpendPerDay > stats.safeSpendPerDay

  const getBarColor = () => {
    if (stats.willRunOut) return 'bg-[#FF3000]'
    if (stats.isOverspending) return 'bg-[#eab308]'
    return 'bg-black'
  }

  const getStatusText = () => {
    if (stats.willRunOut) {
      return `AT THIS RATE YOU'LL RUN OUT ${formatCurrency(Math.abs(stats.projectedBalanceOnPayday || 0))} BEFORE STIPEND`
    }
    if (stats.isOverspending) {
      return `SPENDING ${formatCurrency((stats.actualSpendPerDay || 0) - (stats.safeSpendPerDay || 0))}/DAY OVER SAFE LIMIT`
    }
    return `ON TRACK — PROJECTED ${formatCurrency(stats.projectedBalanceOnPayday)} LEFT ON STIPEND DAY`
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border-2 border-black bg-white p-6">
          <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-2">DAYS UNTIL STIPEND</p>
          <div className="font-black text-4xl tracking-tighter">{stats.daysUntilNextStipend}</div>
          <p className="text-[10px] uppercase tracking-widest mt-2 text-muted-foreground">
            {stats.creditDay}{getOrdinalSuffix(stats.creditDay)} OF THE MONTH
          </p>
        </div>

        <div className="border-2 border-black bg-white p-6">
          <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-2">CYCLE PROGRESS</p>
          <div className="font-black text-2xl tracking-tighter mb-3">{progressPercent}%</div>
          <div className="w-full bg-[#F2F2F2] h-4 border-2 border-black">
            <div
              className={`h-full transition-all duration-150 ${getBarColor()}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest mt-2 text-muted-foreground">
            {stats.daysElapsed} / {stats.totalDaysInCycle} DAYS
          </p>
        </div>

        <div className="border-2 border-black bg-white p-6">
          <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-2">SAFE TO SPEND / DAY</p>
          <div className="font-black text-2xl tracking-tighter">{formatCurrency(stats.safeSpendPerDay)}</div>
          <p className="text-[10px] uppercase tracking-widest mt-2 text-muted-foreground">BASED ON REMAINING BALANCE</p>
        </div>

        <div className="border-2 border-black bg-white p-6">
          <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-2">YOU&apos;RE SPENDING / DAY</p>
          <div className={`font-black text-2xl tracking-tighter ${isOverSafeLimit ? 'text-[#FF3000]' : ''}`}>
            {formatCurrency(stats.actualSpendPerDay)}
          </div>
          <p className="text-[10px] uppercase tracking-widest mt-2 font-bold">
            {isOverSafeLimit ? 'OVER SAFE LIMIT' : 'WITHIN SAFE LIMIT'}
          </p>
        </div>
      </div>

      <div className={`border-2 border-black bg-white p-4 border-l-4 ${stats.willRunOut ? 'border-l-[#FF3000]' : stats.isOverspending ? 'border-l-[#eab308]' : 'border-l-black'}`}>
        <p className="text-xs uppercase tracking-wide font-bold">{getStatusText()}</p>
      </div>

      <div className="border-2 border-black bg-white p-6">
        <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-2">PROJECTED BALANCE ON STIPEND DAY</p>
        <div className={`font-black text-3xl tracking-tighter ${(stats.projectedBalanceOnPayday || 0) < 0 ? 'text-[#FF3000]' : ''}`}>
          {formatCurrency(stats.projectedBalanceOnPayday)}
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Resets Daily</p>
    </div>
  )
}

function getOrdinalSuffix(n: number | null) {
  if (n === null) return ''
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
