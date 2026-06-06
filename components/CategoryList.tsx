'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Category } from '@/types'
import { cn } from '@/lib/utils'

export function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [budgetCategoryId, setBudgetCategoryId] = useState<string | null>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${deleteId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeleteId(null)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBudget() {
    if (!budgetCategoryId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${budgetCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_budget: budgetAmount ? Number(budgetAmount) : null })
      })

      if (res.ok) {
        setBudgetCategoryId(null)
        setBudgetAmount('')
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveBudget() {
    if (!budgetCategoryId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${budgetCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_budget: null })
      })

      if (res.ok) {
        setBudgetCategoryId(null)
        setBudgetAmount('')
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function openBudgetDialog(category: Category) {
    setBudgetCategoryId(category.id)
    setBudgetAmount(category.daily_budget ? category.daily_budget.toString() : '')
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {initialCategories.map((category) => (
          <div
            key={category.id}
            className={cn(
              "group border-2 border-black bg-white p-8 flex flex-col items-center text-center",
              "transition-colors duration-150 hover:bg-[#FF3000] hover:text-white hover:border-white"
            )}
          >
            <div className="text-4xl mb-4">{category.icon}</div>
            <span
              className="font-bold uppercase tracking-wide truncate w-full"
              title={category.name}
            >
              {category.name}
            </span>

            {category.daily_budget ? (
              <div className="mt-3 bg-black text-white uppercase text-xs px-2 py-1 font-bold tracking-widest group-hover:bg-white group-hover:text-black transition-colors duration-150">
                ₹{Number(category.daily_budget).toLocaleString('en-IN')} / DAY
              </div>
            ) : (
              <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground group-hover:text-white/70">
                No Budget
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-4 group-hover:bg-white group-hover:text-black group-hover:border-white"
              onClick={() => openBudgetDialog(category)}
            >
              Set Budget
            </Button>

            <button
              type="button"
              className="mt-3 text-[#FF3000] uppercase text-xs tracking-widest font-bold group-hover:text-white transition-colors duration-150 min-h-[44px]"
              onClick={() => setDeleteId(category.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!budgetCategoryId} onOpenChange={(open) => !open && setBudgetCategoryId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Daily Budget</DialogTitle>
            <DialogDescription>
              Set a daily spending limit for this category
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-xs font-bold uppercase tracking-widest">
                Daily Budget (₹)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleRemoveBudget} disabled={loading}>
              Remove Budget
            </Button>
            <Button variant="outline" onClick={() => setBudgetCategoryId(null)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveBudget} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
