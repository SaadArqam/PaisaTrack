'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useQuickAddStore } from '@/lib/quickAddStore'
import { Category, ExpenseWithCategory } from '@/types'

const ExpenseItem = ({ expense, onDelete }: { expense: ExpenseWithCategory, onDelete: (id: string) => void }) => {
  return (
    <div className="px-4 py-3 border-b border-[#181818] last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl flex items-center justify-center text-[17px]">
            {expense.category?.icon}
          </div>
          <div>
            <div className="text-[13px] font-500 text-[#D4D0C8]">
              {expense.category?.name}
            </div>
            <div className="font-mono text-[10px] text-[#3A3A3A] mt-1 tracking-[0.3px]">
              {format(new Date(expense.date), 'dd MMM')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-[14px] font-500 text-[#C96B6B]">
            ₹{Number(expense.amount).toLocaleString('en-IN')}
          </div>
          <button
            onClick={() => onDelete(expense.id)}
            className="text-[#3A3A3A] hover:text-[#C96B6B] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExpenseManager({ categories, initialExpenses }: { categories: Category[], initialExpenses: ExpenseWithCategory[] }) {
  const router = useRouter()
  const { open } = useQuickAddStore()
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Filter and sort expenses
  const filteredExpenses = initialExpenses.filter(expense => {
    const expDate = expense.date.slice(0, 7) // YYYY-MM
    const matchMonth = expDate === filterMonth
    const matchCategory = filterCategory === 'all' || expense.category_id === filterCategory
    return matchMonth && matchCategory
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const total = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[24px] font-700 tracking-[-0.5px] text-[#E8E4DC]">
          Expenses
        </h1>
        <button
          onClick={open}
          className="h-[44px] px-4 bg-[#E8B84B] rounded-[13px] font-600 text-[14px] text-[#0C0C0C] active:scale-[0.98] transition-all duration-150"
        >
          Add Expense
        </button>
      </div>

      <div className="sticky top-0 z-10 bg-[#0C0C0C] border-b border-[#181818] px-4 py-2.5">
        <div className="flex gap-2">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="flex-1 h-9 bg-[#141414] border border-[#1E1E1E] rounded-lg px-3 text-[12px] text-[#888] focus:border-[#E8B84B] focus:outline-none"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 h-9 bg-[#141414] border border-[#1E1E1E] rounded-lg px-3 text-[12px] text-[#888] focus:border-[#E8B84B] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <ExpenseItem key={expense.id} expense={expense} onDelete={handleDelete} />
          ))
        ) : (
          <div className="px-4 py-6 text-center text-[11px] uppercase tracking-[0.8px] text-[#444]">
            No expenses found for this period
          </div>
        )}
      </div>

      <div className="mx-4 mt-2 bg-[#141414] border border-[#1E1E1E] rounded-xl px-4 py-3 flex justify-between items-center">
        <div className="text-[10px] uppercase tracking-[1px] text-[#444]">
          Total for selected period
        </div>
        <div className="font-mono text-[16px] font-600 text-[#E8E4DC]">
          ₹{total.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  )
}

