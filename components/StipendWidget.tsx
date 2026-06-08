'use client'

import { useState, useEffect } from 'react'

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

  if (loading) {
    return (
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-[#1E1E1E] rounded w-1/3 mb-2" />
          <div className="h-8 bg-[#1E1E1E] rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!stats || stats.stipendAmount === null) {
    return (
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-4">
        <p className="text-[11px] uppercase tracking-[0.8px] text-[#444]">
          Set up your stipend in Settings
        </p>
      </div>
    )
  }

  const status: 'ok' | 'warn' | 'bad' = stats.willRunOut
    ? 'bad'
    : stats.isOverspending
    ? 'warn'
    : 'ok'

  const statusLabel = status === 'ok' ? 'On Track' : status === 'warn' ? 'Watch Out' : 'Risky'

  const statusClasses = {
    ok: 'bg-[rgba(93,190,138,0.12)] text-[#5DBE8A] border border-[rgba(93,190,138,0.25)]',
    warn: 'bg-[rgba(232,184,75,0.12)] text-[#E8B84B] border border-[rgba(232,184,75,0.25)]',
    bad: 'bg-[rgba(201,107,107,0.12)] text-[#C96B6B] border border-[rgba(201,107,107,0.25)]',
  }

  const spendColor = status === 'ok' ? '#5DBE8A' : status === 'warn' ? '#E8B84B' : '#C96B6B'

  return (
    <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[1px] text-[#444] mb-1">
            Days until stipend
          </div>
          <div className="font-mono text-[32px] font-600 text-[#E8E4DC] leading-none">
            {stats.daysUntilNextStipend}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-600 tracking-[0.3px] ${statusClasses[status]}`}>
          {statusLabel}
        </div>
      </div>

      {(stats.isOverspending || stats.willRunOut) && (
        <div className="bg-[#1C1600] border-l-2 border-[#E8B84B] rounded-r-lg px-3 py-2.5 text-[12px] text-[#B8900A] leading-relaxed mb-3">
          {stats.willRunOut
            ? 'At this rate you\'ll run out before your next stipend.'
            : 'You\'re spending more than your safe daily limit.'}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl p-3">
          <div className="text-[9px] uppercase tracking-[1px] text-[#3A3A3A] mb-1.5">
            Safe/day
          </div>
          <div className="font-mono text-[17px] font-500 text-[#5DBE8A]">
            ₹{(stats.safeSpendPerDay || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl p-3">
          <div className="text-[9px] uppercase tracking-[1px] text-[#3A3A3A] mb-1.5">
            Spending/day
          </div>
          <div className="font-mono text-[17px] font-500" style={{ color: spendColor }}>
            ₹{(stats.actualSpendPerDay || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  )
}

