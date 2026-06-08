'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2, Settings } from 'lucide-react'
import Link from 'next/link'

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
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If stipend is not configured
  if (!stats || stats.stipendAmount === null) {
    return (
      <Card className="shadow-md border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Set up your stipend in Settings to unlock spending insights</p>
            </div>
            <Link href="/settings">
              <button className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
                Configure
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercent = stats.totalDaysInCycle && stats.daysElapsed !== null
    ? Math.round((stats.daysElapsed / stats.totalDaysInCycle) * 100)
    : 0

  const isOverSafeLimit = stats.actualSpendPerDay && stats.safeSpendPerDay && stats.actualSpendPerDay > stats.safeSpendPerDay

  return (
    <div className="space-y-4">
      {/* Row 1: Days Until Stipend & Cycle Progress */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Days Until Stipend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.daysUntilNextStipend}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.creditDay}{getOrdinalSuffix(stats.creditDay)} of the month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cycle Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{progressPercent}%</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.daysElapsed} / {stats.totalDaysInCycle} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Safe to Spend/day & You're Spending/day */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Safe to Spend/day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(stats.safeSpendPerDay)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on remaining balance</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">You're Spending/day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverSafeLimit ? 'text-red-500' : 'text-green-500'}`}>
              {formatCurrency(stats.actualSpendPerDay)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isOverSafeLimit ? 'Over safe limit' : 'Within safe limit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Alert Card */}
      <Card className={`shadow-md ${
        stats.willRunOut 
          ? 'border-red-500/20 bg-red-500/5' 
          : stats.isOverspending 
            ? 'border-yellow-500/20 bg-yellow-500/5' 
            : 'border-green-500/20 bg-green-500/5'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {stats.willRunOut ? (
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            ) : stats.isOverspending ? (
              <TrendingUp className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              {stats.willRunOut ? (
                <p className="text-sm font-medium text-red-500">
                  ⚠️ At this rate you'll run out {formatCurrency(Math.abs(stats.projectedBalanceOnPayday || 0))} before your next stipend
                </p>
              ) : stats.isOverspending ? (
                <p className="text-sm font-medium text-yellow-600">
                  📊 Spending {formatCurrency((stats.actualSpendPerDay || 0) - (stats.safeSpendPerDay || 0))}/day over your safe limit
                </p>
              ) : (
                <p className="text-sm font-medium text-green-500">
                  ✅ You're on track! Projected {formatCurrency(stats.projectedBalanceOnPayday)} left on stipend day
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Projected Balance */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Projected Balance on Stipend Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${(stats.projectedBalanceOnPayday || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>
            {formatCurrency(stats.projectedBalanceOnPayday)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getOrdinalSuffix(n: number | null) {
  if (n === null) return ''
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
