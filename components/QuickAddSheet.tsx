'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQuickAddStore } from '@/lib/quickAddStore'

interface Category {
  id: string
  name: string
  icon: string
}

export function QuickAddSheet() {
  const router = useRouter()
  const { isOpen, close } = useQuickAddStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => setCategories(data))
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || !categoryId) return

    setLoading(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          note: note.trim(),
          date,
          category_id: categoryId,
        }),
      })

      if (res.ok) {
        toast.success('Expense added')
        setAmount('')
        setCategoryId('')
        setNote('')
        close()
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add expense')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={close}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-x border-[#1E1E1E] rounded-t-[20px] transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          willChange: 'transform',
        }}
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3 mb-5" />

        <div className="px-5 mb-4">
          <h2 className="text-[16px] font-600 text-[#E8E4DC]">Add Expense</h2>
        </div>

        <div className="flex flex-col gap-3 px-5">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-12 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 text-[14px] text-[#E8E4DC] focus:border-[#E8B84B] outline-none"
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[18px] text-[#555]">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-14 pl-10 pr-4 font-mono text-[22px] font-500 bg-[#101010] border border-[#1E1E1E] rounded-xl focus:border-[#E8B84B] outline-none"
            />
          </div>

          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-12 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 text-[14px] text-[#E8E4DC] focus:border-[#E8B84B] outline-none"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 text-[14px] text-[#E8E4DC] focus:border-[#E8B84B] outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3 mb-5 w-full h-[52px] bg-[#E8B84B] rounded-[13px] font-outfit text-[14px] font-600 text-[#0C0C0C] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </>
  )
}
