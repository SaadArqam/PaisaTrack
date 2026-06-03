'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ChartData {
  name: string
  total: number
  icon: string
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function DashboardChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-muted-foreground border rounded-xl bg-card/50 shadow-inner">
        No spending data for this month.
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: `${item.icon} ${item.name}`,
    total: item.total
  }))

  return (
    <div className="h-[320px] w-full border rounded-xl bg-card shadow-sm p-4 relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={5}
            dataKey="total"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
            contentStyle={{ borderRadius: '12px', backgroundColor: '#020817', border: '1px solid #1e293b', color: '#fff' }}
            itemStyle={{ color: '#fff', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
