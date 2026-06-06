'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Category, ExpenseWithCategory } from '@/types'
import { toast } from 'sonner'

export function ExpenseManager({ categories, initialExpenses }: { categories: Category[], initialExpenses: ExpenseWithCategory[] }) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))

  async function onAddSubmit() {
    setErrorMsg('')
    if (!amount || isNaN(Number(amount)) || !categoryId || !date) return

    setLoading(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), note, date, category_id: categoryId })
      })

      if (res.ok) {
        setAmount('')
        setNote('')
        setCategoryId('')
        router.refresh()

        try {
          const budgetRes = await fetch('/api/budget/stats')
          const budgetStats = await budgetRes.json()
          const categoryBudget = budgetStats.find((b: { categoryId: string }) => b.categoryId === categoryId)
          
          if (categoryBudget) {
            const categoryName = categories.find(c => c.id === categoryId)?.name || 'this category'
            if (categoryBudget.status === 'danger') {
              toast.error(`You've exceeded today's ${categoryName} budget!`)
            } else if (categoryBudget.status === 'warning') {
              toast.warning(`You've used 80%+ of today's ${categoryName} budget`)
            }
          }
        } catch (budgetError) {
          console.error('Budget check failed:', budgetError)
        }
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to add expense')
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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

  const filteredExpenses = initialExpenses.filter(expense => {
    const expDate = expense.date.slice(0, 7)
    const matchMonth = filterMonth ? expDate === filterMonth : true
    const matchCategory = filterCategory === 'all' ? true : expense.category_id === filterCategory
    
    return matchMonth && matchCategory
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  function clearFilters() {
    setFilterCategory('all')
    setFilterMonth(new Date().toISOString().slice(0, 7))
  }

  return (
    <div className="space-y-10">
      {/* Add Expense Form */}
      <div>
        <p className="swiss-section-label">02. ADD EXPENSE</p>
        {errorMsg && (
          <div className="mb-4 border-l-4 border-[#FF3000] bg-[#F2F2F2] p-3 text-xs uppercase tracking-widest font-bold">
            {errorMsg}
          </div>
        )}
        <div className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-black">
              Category
            </Label>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-black">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-black">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-bold uppercase tracking-widest text-black">
              Note (Optional)
            </Label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Dinner, Taxi"
            />
          </div>
          <Button
            onClick={onAddSubmit}
            className="w-full h-14 md:h-16"
            size="lg"
            disabled={loading || !amount || !categoryId || !date}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <p className="swiss-section-label">03. FILTER</p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 sm:border-r-2 sm:border-black sm:pr-6 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-black">Category</Label>
            <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || 'all')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-black">Month</Label>
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full"
            />
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="text-[#FF3000] uppercase text-xs tracking-widest font-bold min-h-[44px] transition-colors duration-150 hover:text-black"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div>
        <Table className="swiss-table">
          <TableHeader>
            <TableRow className="bg-black hover:bg-black border-none">
              <TableHead className="text-white bg-black">Date</TableHead>
              <TableHead className="text-white bg-black">Category</TableHead>
              <TableHead className="text-white bg-black">Note</TableHead>
              <TableHead className="text-white bg-black text-right">Amount</TableHead>
              <TableHead className="text-white bg-black w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, index) => (
                <TableRow
                  key={expense.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}
                >
                  <TableCell className="uppercase tracking-wide text-xs whitespace-nowrap">
                    {format(new Date(expense.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{expense.category?.icon}</span>
                      <span className="font-bold uppercase tracking-wide text-xs">
                        {expense.category?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs">
                    {expense.note || '—'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{Number(expense.amount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className="text-[#FF3000] font-black text-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-150 hover:text-black"
                      aria-label="Delete expense"
                    >
                      ×
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center uppercase tracking-widest text-xs">
                  No expenses found for this period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="bg-black text-white px-4 py-3 flex justify-between items-center uppercase tracking-widest text-xs font-bold">
          <span>Total</span>
          <span>₹{totalFiltered.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
