'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Wallet, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Category } from '@/types'

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {initialCategories.map((category) => (
          <Card key={category.id} className="relative group overflow-hidden shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
              <div className="text-4xl bg-muted/50 p-3 rounded-full">{category.icon}</div>
              <span className="font-medium text-center truncate w-full" title={category.name}>{category.name}</span>
              
              {category.daily_budget ? (
                <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  Daily: ₹{Number(category.daily_budget).toLocaleString('en-IN')}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No budget set</div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => openBudgetDialog(category)}
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  Set Budget
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setDeleteId(category.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone. Expenses linked to this category might be affected.
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
              <Label htmlFor="budget">Daily Budget (₹)</Label>
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
