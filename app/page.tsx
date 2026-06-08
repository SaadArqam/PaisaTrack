import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { StipendWidget } from '@/components/StipendWidget'
import { BudgetOverview } from '@/components/BudgetOverview'
import { AddExpenseButton } from '@/components/AddExpenseButton'
import { startOfMonth, endOfMonth, format } from 'date-fns'

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
  allExpenses?.forEach((expense: any) => {
    const expDate = new Date(expense.date)
    if (expDate >= monthStart && expDate <= monthEnd) {
      totalSpentThisMonth += Number(expense.amount)
    }
  })

  const { data: recentExpenses } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .order('date', { ascending: false })
    .limit(5)

  const balanceString = totalBalance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const [rupees, paise] = balanceString.split('.')
  const dateString = format(now, 'dd MMM')

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center px-5 pt-5 pb-3">
        <div>
          <span className="text-[18px] font-outfit font-700 tracking-[-0.5px] text-[#E8E4DC]">
            Paisa
          </span>
          <span className="text-[18px] font-outfit font-700 tracking-[-0.5px] text-[#E8B84B]">
            Track
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="font-mono text-[9px] text-[#555] bg-[#161616] border border-[#1E1E1E] px-2.5 py-1.5 rounded-md tracking-[1px]">
            {dateString}
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[11px] font-600 text-[#666]">
            A
          </div>
        </div>
      </div>

      <div className="mx-4 mb-1 bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden">
        <div className="p-5">
          <div className="text-[10px] font-500 tracking-[1.5px] text-[#555] uppercase mb-2.5">
            Current Balance
          </div>
          <div className="flex items-start gap-1">
            <span className="font-mono text-[20px] text-[#555] mt-[6px]">₹</span>
            <span className="font-mono text-[40px] font-600 tracking-[-2px] text-[#E8E4DC] leading-none">
              {rupees}
            </span>
            <span className="font-mono text-[24px] text-[#444] leading-none mt-[4px]">.{paise}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-[#1E1E1E]">
          <div className="py-3 px-4">
            <div className="text-[9px] uppercase tracking-[1px] text-[#444] font-500 mb-1.5">
              Credited
            </div>
            <div className="font-mono text-[14px] font-500 text-[#5DBE8A]">
              ₹{totalCredited.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="py-3 px-4 border-x border-[#1E1E1E]">
            <div className="text-[9px] uppercase tracking-[1px] text-[#444] font-500 mb-1.5">
              Spent
            </div>
            <div className="font-mono text-[14px] font-500 text-[#C96B6B]">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="py-3 px-4">
            <div className="text-[9px] uppercase tracking-[1px] text-[#444] font-500 mb-1.5">
              This Month
            </div>
            <div className="font-mono text-[14px] font-500 text-[#666]">
              ₹{totalSpentThisMonth.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-[#181818] mx-4 my-3" />

      <div className="px-4 mb-3">
        <div className="flex justify-between items-center mb-2.5">
          <div className="text-[10px] font-600 tracking-[1.2px] uppercase text-[#444]">
            Stipend
          </div>
          <Link href="/settings" className="text-[11px] text-[#E8B84B] font-500">
            Settings
          </Link>
        </div>
        <StipendWidget />
      </div>

      <div className="px-4 mb-3">
        <div className="flex justify-between items-center mb-2.5">
          <div className="text-[10px] font-600 tracking-[1.2px] uppercase text-[#444]">
            Today's Budgets
          </div>
          <div className="font-mono text-[9px] text-[#3A3A3A]">
            AS OF {format(now, 'HH:mm')}
          </div>
        </div>
        <BudgetOverview />
      </div>

      <div className="px-4 mb-0">
        <div className="flex justify-between items-center mb-2.5">
          <div className="text-[10px] font-600 tracking-[1.2px] uppercase text-[#444]">
            Recent
          </div>
          <Link href="/expenses" className="text-[11px] text-[#E8B84B] font-500">
            See all →
          </Link>
        </div>
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden">
          {recentExpenses && recentExpenses.length > 0 ? (
            recentExpenses.map((expense, index) => (
              <div
                key={expense.id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-[#181818] last:border-0`}
              >
                <div className="w-9 h-9 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl flex items-center justify-center text-[17px] flex-shrink-0">
                  {expense.category?.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-500 text-[#D4D0C8]">
                    {expense.category?.name}
                  </div>
                  <div className="font-mono text-[10px] text-[#3A3A3A] mt-1 tracking-[0.3px] uppercase">
                    {format(new Date(expense.date), 'dd MMM')}
                  </div>
                </div>
                <div className="font-mono text-[14px] font-500 text-[#C96B6B] ml-auto">
                  ₹{Number(expense.amount).toLocaleString('en-IN')}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-[11px] uppercase tracking-[0.8px] text-[#444]">
              No recent expenses
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-3">
        <AddExpenseButton />
      </div>
    </div>
  )
}

