'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AddBalanceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (!amount || isNaN(Number(amount))) return

    setLoading(true)
    try {
      const res = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), note, type: 'credit' })
      })

      if (res.ok) {
        setAmount('')
        setNote('')
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
    <form onSubmit={onSubmit} className="space-y-3">
      {errorMsg && (
        <div className="text-[12px] text-[#C96B6B]">{errorMsg}</div>
      )}
      <input
        type="number"
        step="0.01"
        min="1"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="w-full h-16 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl px-4 font-mono text-[28px] font-600 text-[#E8E4DC] placeholder:text-[#3A3A3A] focus:border-[#E8B84B] focus:outline-none transition-colors"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full h-12 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl px-4 text-[14px] text-[#E8E4DC] placeholder:text-[#3A3A3A] focus:border-[#E8B84B] focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-[52px] bg-[#E8B84B] rounded-[13px] text-[#0C0C0C] font-600 text-[14px] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Money'}
      </button>
    </form>
  )
}

