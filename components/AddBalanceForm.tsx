'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function AddBalanceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit() {
    setErrorMsg('')
    if (!amount || isNaN(Number(amount))) return

    setLoading(true)
    try {
      const res = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), note, type: 'credit', date })
      })

      if (res.ok) {
        setAmount('')
        setNote('')
        setDate(new Date().toISOString().split('T')[0])
        router.refresh()
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to add balance')
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
      <p className="swiss-section-label">01. CREDIT ENTRY</p>
      {errorMsg && (
        <div className="mb-4 border-l-4 border-[#FF3000] bg-[#F2F2F2] p-3 text-xs uppercase tracking-widest font-bold">
          {errorMsg}
        </div>
      )}
      <div className="space-y-6 max-w-lg">
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
            placeholder="e.g., Salary, Gift"
          />
        </div>
        <Button
          onClick={onSubmit}
          className="w-full h-14 md:h-16"
          size="lg"
          disabled={loading || !amount}
        >
          {loading ? 'Adding...' : 'Add Money'}
        </Button>
      </div>
    </div>
  )
}
