'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function AddCategoryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💰')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit() {
    setErrorMsg('')
    if (!name || !icon) return

    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon })
      })

      if (res.ok) {
        setName('')
        setIcon('💰')
        router.refresh()
      } else {
        const data = await res.json()
        if (data.error?.includes('duplicate key')) {
          setErrorMsg('A category with this name already exists.')
        } else {
          setErrorMsg(data.error || 'Failed to create category')
        }
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {errorMsg && (
        <div className="mb-4 border-l-4 border-[#FF3000] bg-[#F2F2F2] p-3 text-xs uppercase tracking-widest font-bold">
          {errorMsg}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
        <div className="space-y-2 sm:w-20">
          <Label htmlFor="icon" className="text-xs font-bold uppercase tracking-widest text-black">
            Icon
          </Label>
          <Input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🍔"
            maxLength={2}
            className="text-center text-2xl"
          />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-black">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Groceries"
          />
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading || !name || !icon}
          className="w-full sm:w-auto h-14 min-w-[160px]"
          size="lg"
        >
          {loading ? 'Adding...' : 'Add Category'}
        </Button>
      </div>
    </div>
  )
}
