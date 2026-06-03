'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
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
    // Update time every minute
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

  const getStatusColor = (status: 'safe' | 'warning' | 'danger') => {
    switch (status) {
      case 'safe': return '#22c55e'
      case 'warning': return '#eab308'
      case 'danger': return '#ef4444'
    }
  }

  const safeCount = stats.filter(s => s.status === 'safe').length

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stats.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Today's Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">No budgets set — go to Categories to set daily limits</p>
            <Link href="/categories">
              <button className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">
                Set Budgets
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Today's Budget</h2>
          <p className="text-xs text-muted-foreground">As of {format(currentTime, 'h:mm a')}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {safeCount} of {stats.length} categories within budget today
        </p>
      </div>

      <div className="grid gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.categoryId} 
            className="shadow-md"
            style={{ borderLeft: `4px solid ${getStatusColor(stat.status)}` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-muted/50 p-2 rounded-full">{stat.categoryIcon}</span>
                  <div>
                    <h3 className="font-medium">{stat.categoryName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(stat.spentToday)} spent of {formatCurrency(stat.dailyBudget)} today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stat.status === 'danger' && (
                    <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                      Over Budget!
                    </Badge>
                  )}
                  {stat.status === 'warning' && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
                      Almost there
                    </Badge>
                  )}
                  <span className="text-sm font-medium">{Math.round(stat.percentageUsed)}%</span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-600"
                  style={{
                    width: `${Math.min(stat.percentageUsed, 100)}%`,
                    backgroundColor: getStatusColor(stat.status)
                  }}
                />
              </div>

              <div className="mt-2 text-xs">
                {stat.remainingBudget < 0 ? (
                  <p className="text-red-500 font-medium">
                    {formatCurrency(Math.abs(stat.remainingBudget))} over today's limit
                  </p>
                ) : (
                  <p className="text-green-500 font-medium">
                    {formatCurrency(stat.remainingBudget)} left today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">Resets at midnight</p>
    </div>
  )
}
