'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BudgetStat {
  categoryId: string
  categoryName: string
  categoryIcon: string
  dailyBudget: number
  spentToday: number
  remainingBudget: number
  percentageUsed: number
  status: 'safe' | 'warning' | 'danger'
}

export function BudgetOverview() {
  const [stats, setStats] = useState<BudgetStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/budget/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch budget stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBarColor = (status: 'safe' | 'warning' | 'danger') => {
    switch (status) {
      case 'safe': return '#5DBE8A'
      case 'warning': return '#E8B84B'
      case 'danger': return '#C96B6B'
    }
  }

  if (loading) {
    return (
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1E1E1E] rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-[#1E1E1E] rounded w-1/3 mb-1.5" />
                <div className="h-[3px] bg-[#1E1E1E] rounded-sm w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-4">
        <p className="text-[11px] uppercase tracking-[0.8px] text-[#444]">
          No budgets set — go to <Link href="/categories" className="text-[#E8B84B]">Categories</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden">
      {stats.map((stat, index) => (
        <div
          key={stat.categoryId}
          className={`px-4 py-3 border-b border-[#181818] ${index === stats.length - 1 ? 'border-b-0' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl flex items-center justify-center text-[17px] flex-shrink-0">
                {stat.categoryIcon}
              </div>
              <div>
                <div className="text-[13px] font-500 text-[#D4D0C8]">
                  {stat.categoryName}
                </div>
                <div className="mt-1.5 h-[3px] w-32 bg-[#1E1E1E] rounded-sm overflow-hidden">
                  <div
                    className="h-[3px] rounded-sm transition-all duration-500"
                    style={{
                      width: `${Math.min(stat.percentageUsed, 100)}%`,
                      backgroundColor: getBarColor(stat.status),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-mono text-[13px] font-500 text-[#D4D0C8]">
                ₹{stat.spentToday.toLocaleString('en-IN')}
              </div>
              <div className="font-mono text-[10px] text-[#3A3A3A]">
                / ₹{stat.dailyBudget.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

