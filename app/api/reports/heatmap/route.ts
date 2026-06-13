import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '90')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('expenses')
    .select('date, amount')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .order('date', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Group by date
  const grouped: Record<string, number> = {}
  data?.forEach(e => {
    const date = new Date(e.date).toISOString().split('T')[0]
    grouped[date] = (grouped[date] || 0) + Number(e.amount)
  })

  // Calculate stats
  const values = Object.values(grouped)
  const activeDays = values.length
  const totalDays = days
  const biggestDay = Math.max(...values, 0)
  const dailyAverage = activeDays > 0 ? values.reduce((a, b) => a + b, 0) / activeDays : 0

  // Calculate longest streak
  let longestStreak = 0
  let currentStreak = 0
  let prevDate: Date | null = null
  Object.keys(grouped).sort().forEach(dateStr => {
    const date = new Date(dateStr)
    if (prevDate) {
      const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
      longestStreak = 1
    }
    prevDate = date
  })

  return Response.json({
    heatmap: grouped,
    stats: {
      activeDays,
      totalDays,
      biggestDay,
      dailyAverage: Math.round(dailyAverage),
      longestStreak
    }
  })
}
