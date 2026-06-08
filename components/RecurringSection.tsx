'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { RecurringExpense, RecurringWithStatus } from '@/types'
import { getDaysUntilDue, getRecurringStatus, formatDueLabel } from '@/lib/recurring-utils'

export function RecurringSection() {
  const router = useRouter()
  const [items, setItems] = useState<RecurringWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecurring()
  }, [])

  const fetchRecurring = async () => {
    try {
      const res = await fetch('/api/recurring')
      const data: RecurringExpense[] = await res.json()

      const withStatus: RecurringWithStatus[] = data.map(item => {
        const days = getDaysUntilDue(item.next_due_date)
        return {
          ...item,
          days_until_due: days,
          status: getRecurringStatus(days),
        }
      })

      const priority = { overdue: 0, urgent: 1, upcoming: 2, normal: 3 }
      withStatus.sort((a, b) => priority[a.status] - priority[b.status])

      setItems(withStatus.filter(item => item.days_until_due <= 7))
    } catch (error) {
      console.error('Failed to fetch recurring:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id: string) => {
    setPayingId(id)
    try {
      const res = await fetch(`/api/recurring/${id}/pay`, { method: 'POST' })
      if (res.ok) {
        toast.success('Payment recorded')
        router.refresh()
        fetchRecurring()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Failed to pay:', error)
      toast.error('Failed to record payment')
    } finally {
      setPayingId(null)
    }
  }

  if (loading) return null
  if (items.length === 0) return null

  const getDueColor = (status: RecurringWithStatus['status']) => {
    if (status === 'overdue') return '#E05C5C'
    if (status === 'urgent') return '#E8B84B'
    return undefined
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-semibold tracking-[1.2px] uppercase text-[#444]">
          Upcoming Payments
        </h2>
        <Link
          href="/recurring"
          className="text-[11px] text-[#E8B84B] font-medium flex items-center gap-1 transition-colors duration-150"
        >
          Manage <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <Card className="bg-card border border-border rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 ${index < items.length - 1 ? 'border-b border-[#181818]' : ''}`}
            >
              <div className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center text-lg shrink-0">
                {item.categories?.icon || '💰'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground uppercase">{item.frequency}</p>
              </div>

              <p
                className={`text-xs font-medium shrink-0 ${!getDueColor(item.status) ? 'text-muted-foreground' : ''}`}
                style={getDueColor(item.status) ? { color: getDueColor(item.status) } : undefined}
              >
                {formatDueLabel(item.days_until_due)}
              </p>

              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <p className="font-mono text-sm font-medium">
                  ₹{Number(item.amount).toLocaleString('en-IN')}
                </p>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs font-semibold"
                  variant={item.status === 'overdue' || item.status === 'urgent' ? 'default' : 'outline'}
                  style={
                    item.status === 'overdue' || item.status === 'urgent'
                      ? { backgroundColor: '#E8B84B', color: '#0C0C0C' }
                      : undefined
                  }
                  disabled={payingId === item.id}
                  onClick={() => handlePay(item.id)}
                >
                  {payingId === item.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Pay Now'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
