'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

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
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchStats()
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  const getBarColor = (status: 'safe' | 'warning' | 'danger') => {
    switch (status) {
      case 'safe': return 'bg-black'
      case 'warning': return 'bg-[#eab308]'
      case 'danger': return 'bg-[#FF3000]'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b-2 border-black py-6 animate-pulse bg-[#F2F2F2] h-20" />
        ))}
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="border-b-2 border-black py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs uppercase tracking-widest font-medium flex-1">
          No budgets set — go to Categories to set daily limits
        </p>
        <Link href="/categories">
          <Button variant="outline">Set Budgets</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        As of {format(currentTime, 'h:mm a').toUpperCase()}
      </p>

      <div>
        {stats.map((stat) => (
          <div
            key={stat.categoryId}
            className={`py-4 border-b-2 border-black ${stat.status === 'danger' ? 'border-l-4 border-l-[#FF3000] pl-4' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.categoryIcon}</span>
                <span className="font-bold uppercase tracking-wide text-sm">{stat.categoryName}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm">{formatCurrency(stat.spentToday)}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {' '}/ {formatCurrency(stat.dailyBudget)}
                </span>
              </div>
            </div>

            <div className="w-full bg-[#F2F2F2] h-2 border border-black">
              <div
                className={`h-full transition-all duration-150 ${getBarColor(stat.status)}`}
                style={{ width: `${Math.min(stat.percentageUsed, 100)}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between items-center">
              <p className="text-[10px] uppercase tracking-widest font-bold">
                {stat.remainingBudget < 0
                  ? `${formatCurrency(Math.abs(stat.remainingBudget))} OVER LIMIT`
                  : `${formatCurrency(stat.remainingBudget)} LEFT TODAY`}
              </p>
              <span className="text-xs font-bold uppercase tracking-widest">{Math.round(stat.percentageUsed)}%</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">Resets at midnight</p>
    </div>
  )
}
