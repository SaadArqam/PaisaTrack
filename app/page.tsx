import { createClient } from '@/lib/supabase-server'
import { StipendWidget } from '@/components/StipendWidget'
import { BudgetOverview } from '@/components/BudgetOverview'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: credits } = await supabase.from('balance_entries').select('amount').eq('type', 'credit')
  const { data: debits } = await supabase.from('balance_entries').select('amount').eq('type', 'debit')
  const { data: allExpenses } = await supabase.from('expenses').select('amount, date, category:categories(id, name, icon)')
  
  const totalCredited = credits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalDebited = debits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalExpenses = allExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  
  const totalBalance = totalCredited - totalDebited - totalExpenses

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  let totalSpentThisMonth = 0
  let transactionCount = 0

  allExpenses?.forEach((expense: { amount: number; date: string }) => {
    const expDate = new Date(expense.date)
    if (expDate >= monthStart && expDate <= monthEnd) {
      totalSpentThisMonth += Number(expense.amount)
      transactionCount += 1
    }
  })

  const { data: recentExpenses } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .order('date', { ascending: false })
    .limit(5)

  const todayFormatted = format(now, 'EEEE, MMMM d, yyyy').toUpperCase()

  return (
    <div className="flex flex-col">
      {/* Header strip */}
      <header className="bg-black text-white px-6 md:px-10 py-8 border-b-4 border-black flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="font-black uppercase tracking-tighter text-5xl md:text-7xl leading-none">
          DASHBOARD
        </h1>
        <p className="text-sm uppercase tracking-widest font-medium">{todayFormatted}</p>
      </header>

      {/* Balance Hero */}
      <section className="border-b-4 border-black border-4 border-black bg-white swiss-grid-pattern">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6 md:p-10">
            <p className="swiss-section-label">01. CURRENT BALANCE</p>
            <div className="font-black tracking-tighter text-6xl md:text-8xl leading-none">
              <span className="text-4xl md:text-6xl">₹</span>
              {totalBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="lg:w-72 border-t-4 lg:border-t-0 lg:border-l-4 border-black p-6 md:p-8 flex flex-col justify-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-1">TOTAL CREDITED</p>
              <p className="font-black text-2xl md:text-3xl tracking-tighter">
                ₹{totalCredited.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="border-t-2 border-black pt-6">
              <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-1">TOTAL SPENT</p>
              <p className="font-black text-2xl md:text-3xl tracking-tighter">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b-4 border-black bg-[#F2F2F2] swiss-dots">
        <div className="p-6 md:p-8 border-b-4 md:border-b-0 md:border-r-4 border-black">
          <p className="swiss-section-label">02. CREDITED</p>
          <p className="font-black text-4xl md:text-5xl tracking-tighter">
            ₹{totalCredited.toLocaleString('en-IN')}
          </p>
          <p className="text-xs uppercase tracking-widest mt-2 font-medium">ALL TIME</p>
        </div>
        <div className="p-6 md:p-8 border-b-4 md:border-b-0 md:border-r-4 border-black">
          <p className="swiss-section-label">SPENT THIS MONTH</p>
          <p className="font-black text-4xl md:text-5xl tracking-tighter">
            ₹{totalSpentThisMonth.toLocaleString('en-IN')}
          </p>
          <p className="text-xs uppercase tracking-widest mt-2 font-medium">CURRENT PERIOD</p>
        </div>
        <div className="p-6 md:p-8">
          <p className="swiss-section-label">TRANSACTIONS</p>
          <p className="font-black text-4xl md:text-5xl tracking-tighter">{transactionCount}</p>
          <p className="text-xs uppercase tracking-widest mt-2 font-medium">THIS MONTH</p>
        </div>
      </section>

      {/* Stipend Widget */}
      <section className="p-6 md:p-10 border-b-4 border-black">
        <p className="swiss-section-label">03. STIPEND ANALYSIS</p>
        <StipendWidget />
      </section>

      {/* Budget Overview */}
      <section className="p-6 md:p-10 border-b-4 border-black">
        <p className="swiss-section-label">04. DAILY BUDGETS</p>
        <BudgetOverview />
      </section>

      {/* Recent Expenses */}
      <section className="p-6 md:p-10">
        <p className="swiss-section-label">05. RECENT ACTIVITY</p>
        <Table className="swiss-table">
          <TableHeader>
            <TableRow className="bg-black hover:bg-black border-none">
              <TableHead className="text-white bg-black">Category</TableHead>
              <TableHead className="text-white bg-black">Date</TableHead>
              <TableHead className="text-white bg-black">Note</TableHead>
              <TableHead className="text-white bg-black text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentExpenses && recentExpenses.length > 0 ? (
              recentExpenses.map((expense, index) => (
                <TableRow
                  key={expense.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{expense.category?.icon}</span>
                      <span className="font-bold uppercase tracking-wide text-xs">
                        {expense.category?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="uppercase tracking-wide text-xs">
                    {format(new Date(expense.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs">
                    {expense.note || '—'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{Number(expense.amount).toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 uppercase tracking-widest text-xs">
                  No recent expenses
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
