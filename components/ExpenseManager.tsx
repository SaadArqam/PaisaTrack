'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { Category, ExpenseWithCategory } from '@/types'
import { toast } from 'sonner'

function getDefaultNextDueDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}

export function ExpenseManager({ categories, initialExpenses }: { categories: Category[], initialExpenses: ExpenseWithCategory[] }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Local category list — seeded from server prop, updated after inline creation
  const [categoryList, setCategoryList] = useState<Category[]>(categories)

  // Inline create-category state
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('💰')
  const [creatingCat, setCreatingCat] = useState(false)

  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringName, setRecurringName] = useState('')
  const [recurringNextDue, setRecurringNextDue] = useState(getDefaultNextDueDate())
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'custom'>('monthly')
  const [recurringCustomDays, setRecurringCustomDays] = useState('30')

  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [searchQuery, setSearchQuery] = useState('')

  async function onAddSubmit() {
    setErrorMsg('')
    if (!amount || isNaN(Number(amount)) || !categoryId || !date) return
    if (isRecurring && !recurringName.trim()) {
      setErrorMsg('Payment name is required for recurring expenses')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), note, date, category_id: categoryId })
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to add expense')
        return
      }

      if (isRecurring) {
        const recurringRes = await fetch('/api/recurring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: recurringName.trim(),
            amount: Number(amount),
            category_id: categoryId,
            frequency: recurringFrequency,
            custom_days: recurringFrequency === 'custom' ? Number(recurringCustomDays) || 30 : null,
            next_due_date: recurringNextDue,
          }),
        })

        if (!recurringRes.ok) {
          const data = await recurringRes.json()
          setErrorMsg(data.error || 'Expense added but failed to set recurring reminder')
          router.refresh()
          return
        }

        toast.success('Expense added + recurring reminder set')
      }

      setAmount('')
      setNote('')
      setCategoryId('')
      setIsRecurring(false)
      setRecurringName('')
      setRecurringNextDue(getDefaultNextDueDate())
      setRecurringFrequency('monthly')
      setRecurringCustomDays('30')
      router.refresh()

      if (!isRecurring) {
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
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return
    setCreatingCat(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), icon: newCatEmoji || '💰' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create category')
        return
      }
      // Refetch the full category list
      const listRes = await fetch('/api/categories')
      const listData = await listRes.json()
      setCategoryList(Array.isArray(listData) ? listData : categoryList)
      // Auto-select the newly created category
      setCategoryId(data.id)
      // Reset and close form
      setNewCatName('')
      setNewCatEmoji('💰')
      setShowNewCategory(false)
      toast.success('Category created')
    } catch {
      toast.error('Failed to create category')
    } finally {
      setCreatingCat(false)
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
    
    const searchLower = searchQuery.toLowerCase()
    const matchSearch = !searchLower || 
      (expense.note && expense.note.toLowerCase().includes(searchLower)) ||
      (expense.category?.name && expense.category.name.toLowerCase().includes(searchLower))

    return matchMonth && matchCategory && matchSearch
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
            <CardDescription>Record a new transaction</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <Alert variant="destructive" className="mb-4 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{errorMsg}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={categoryId}
                  onValueChange={(val) => {
                    if (val === '__new__') {
                      setShowNewCategory(true)
                      // Don't set __new__ as the real value
                    } else {
                      setCategoryId(val || '')
                      setShowNewCategory(false)
                    }
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">
                      <span style={{ color: '#E8B84B', fontWeight: 600 }}>+ Create new category</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Inline create-category form */}
                {showNewCategory && (
                  <div style={{
                    backgroundColor: '#161616',
                    border: '1px solid #2A2A2A',
                    borderRadius: '12px',
                    padding: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        value={newCatEmoji}
                        onChange={e => setNewCatEmoji(e.target.value)}
                        placeholder="💰"
                        style={{
                          width: '50px', height: '40px', textAlign: 'center', fontSize: '18px',
                          backgroundColor: '#0C0C0C', border: '1px solid #222',
                          borderRadius: '8px', color: '#E8E4DC', outline: 'none'
                        }}
                      />
                      <input
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        placeholder="Category name"
                        onKeyDown={e => { if (e.key === 'Enter' && newCatName.trim()) handleCreateCategory() }}
                        style={{
                          flex: 1, height: '40px', backgroundColor: '#0C0C0C',
                          border: '1px solid #222', borderRadius: '8px',
                          padding: '0 12px', color: '#E8E4DC', fontSize: '13px', outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleCreateCategory}
                        disabled={!newCatName.trim() || creatingCat}
                        style={{
                          flex: 1, height: '38px', backgroundColor: '#E8B84B', color: '#0C0C0C',
                          border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                          cursor: !newCatName.trim() || creatingCat ? 'not-allowed' : 'pointer',
                          opacity: !newCatName.trim() || creatingCat ? 0.6 : 1,
                        }}
                      >
                        {creatingCat ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewCategory(false)
                          setNewCatName('')
                          setNewCatEmoji('💰')
                        }}
                        style={{
                          flex: 1, height: '38px', backgroundColor: 'transparent', color: '#666',
                          border: '1px solid #222', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#E8E4DC',
                    padding: '0 16px',
                    height: '48px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#E8E4DC',
                    padding: '0 16px',
                    height: '48px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <input
                  id="note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Dinner, Taxi"
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#E8E4DC',
                    padding: '0 16px',
                    height: '48px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4"
                    style={{ accentColor: '#E8B84B' }}
                  />
                  <span className="text-sm font-medium">Recurring payment</span>
                </label>

                <div
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{ maxHeight: isRecurring ? '400px' : '0', opacity: isRecurring ? 1 : 0 }}
                >
                  <div className="space-y-4 pt-2 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="recurringName">Payment name</Label>
                      <input
                        id="recurringName"
                        type="text"
                        value={recurringName}
                        onChange={(e) => setRecurringName(e.target.value)}
                        placeholder="e.g., Tiffin Service"
                        style={{
                          backgroundColor: '#111111',
                          border: '1px solid #222222',
                          borderRadius: '10px',
                          color: '#E8E4DC',
                          padding: '0 16px',
                          height: '48px',
                          width: '100%',
                          outline: 'none',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurringNextDue">Next due date</Label>
                      <input
                        id="recurringNextDue"
                        type="date"
                        value={recurringNextDue}
                        onChange={(e) => setRecurringNextDue(e.target.value)}
                        style={{
                          backgroundColor: '#111111',
                          border: '1px solid #222222',
                          borderRadius: '10px',
                          color: '#E8E4DC',
                          padding: '0 16px',
                          height: '48px',
                          width: '100%',
                          outline: 'none',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurringFrequency">Repeats</Label>
                      <Select
                        value={recurringFrequency}
                        onValueChange={(val) => setRecurringFrequency((val || 'monthly') as 'weekly' | 'monthly' | 'custom')}
                      >
                        <SelectTrigger id="recurringFrequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="custom">Custom interval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {recurringFrequency === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="recurringCustomDays">Every X days</Label>
                        <Input
                          id="recurringCustomDays"
                          type="number"
                          min="1"
                          value={recurringCustomDays}
                          onChange={(e) => setRecurringCustomDays(e.target.value)}
                          placeholder="30"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onAddSubmit}
                className="w-full min-h-[44px]"
                disabled={loading || !amount || !categoryId || !date}
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#0C0C0C',
                  border: 'none',
                  borderRadius: '13px',
                  height: '52px',
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading || !amount || !categoryId || !date ? 'not-allowed' : 'pointer',
                  opacity: loading || !amount || !categoryId || !date ? 0.5 : 1,
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <Card className="shadow-md border-muted/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Expense History</CardTitle>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <Input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[160px]"
                />
                <Input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full sm:w-[160px]"
                />
                <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || 'all')}>
                  <SelectTrigger className="w-full sm:w-[160px]">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(new Date(expense.date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span style={{ backgroundColor: '#1A1A1A', borderRadius: '8px', padding: '6px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              {expense.category?.icon}
                            </span>
                            <span className="font-medium">{expense.category?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{expense.note || '-'}</TableCell>
                        <TableCell className="text-right" style={{ color: '#C96B6B', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          ₹{Number(expense.amount).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No expenses found for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
              <span className="font-medium text-muted-foreground">Total for selected period:</span>
              <span className="text-xl font-bold tracking-tight font-mono text-destructive">
                ₹{totalFiltered.toLocaleString('en-IN')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
