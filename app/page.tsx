import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardChart } from '@/components/DashboardChart'
import { StipendWidget } from '@/components/StipendWidget'
import { BudgetOverview } from '@/components/BudgetOverview'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { TrendingUp, TrendingDown, Activity, Wallet } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch summary data
  const { data: credits } = await supabase.from('balance_entries').select('amount').eq('type', 'credit')
  const { data: debits } = await supabase.from('balance_entries').select('amount').eq('type', 'debit')
  const { data: allExpenses } = await supabase.from('expenses').select('amount, date, category:categories(id, name, icon)')
  
  const totalCredited = credits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalDebited = debits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalExpenses = allExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  
  const totalBalance = totalCredited - totalDebited - totalExpenses

  // Current month stats
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  let totalSpentThisMonth = 0
  let transactionCount = 0
  const categoryTotals: Record<string, { name: string, icon: string, total: number }> = {}

  allExpenses?.forEach((expense: any) => {
    const expDate = new Date(expense.date)
    if (expDate >= monthStart && expDate <= monthEnd) {
      const amt = Number(expense.amount)
      totalSpentThisMonth += amt
      transactionCount += 1
      
      const cat = expense.category
      if (cat) {
        if (!categoryTotals[cat.id]) {
          categoryTotals[cat.id] = { name: cat.name, icon: cat.icon, total: 0 }
        }
        categoryTotals[cat.id].total += amt
      }
    }
  })

  const spendingByCategory = Object.values(categoryTotals).sort((a, b) => b.total - a.total)

  // Last 5 expenses
  const { data: recentExpenses } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .order('date', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your finances</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg lg:col-span-1 md:col-span-2 overflow-hidden relative flex flex-col justify-between h-full min-h-[100px]">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-4xl font-semibold tracking-tight">₹{totalBalance.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between h-full min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credited</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCredited.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between h-full min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent This Month</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpentThisMonth.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between h-full min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <StipendWidget />

      <BudgetOverview />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-2 lg:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Spending by Category</h2>
          <DashboardChart data={spendingByCategory} />
        </div>

        <div className="col-span-2 lg:col-span-4 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Expenses</h2>
          <Card className="shadow-md border-muted/50 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExpenses && recentExpenses.length > 0 ? (
                    recentExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg bg-background rounded-full p-1 shadow-sm border">{expense.category?.icon}</span>
                            <span className="font-medium">{expense.category?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(new Date(expense.date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {expense.note || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{Number(expense.amount).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                        No recent expenses
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
