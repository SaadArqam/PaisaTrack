export function calculateNextDueDate(currentDue: string, frequency: string, customDays?: number): string {
  const date = new Date(currentDue)
  if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1)
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7)
  } else if (frequency === 'custom') {
    date.setDate(date.getDate() + (customDays || 30))
  }
  return date.toISOString().split('T')[0]
}

export function getDaysUntilDue(nextDueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextDueDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getRecurringStatus(daysUntilDue: number): 'overdue' | 'urgent' | 'upcoming' | 'normal' {
  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= 3) return 'urgent'
  if (daysUntilDue <= 7) return 'upcoming'
  return 'normal'
}

export function formatDueLabel(days: number): string {
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}
