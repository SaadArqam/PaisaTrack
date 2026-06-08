'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [amount, setAmount] = useState('')
  const [creditDay, setCreditDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentConfig, setCurrentConfig] = useState<{ amount: number, credit_day: number } | null>(null)

  useEffect(() => {
    fetchCurrentConfig()
  }, [])

  const fetchCurrentConfig = async () => {
    try {
      const res = await fetch('/api/stipend')
      const data = await res.json()
      if (data) {
        setCurrentConfig(data)
        setAmount(data.amount.toString())
        setCreditDay(data.credit_day.toString())
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stipend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          credit_day: Number(creditDay)
        })
      })
      if (res.ok) {
        fetchCurrentConfig()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6">
      <h1 className="text-[24px] font-700 tracking-[-0.5px] text-[#E8E4DC] mb-4">
        Settings
      </h1>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-5 mb-3">
        <div className="text-[10px] uppercase tracking-[1.2px] text-[#444] font-600 mb-4">
          Stipend Configuration
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[1px] text-[#3A3A3A] font-500 mb-1.5">
              Monthly Stipend
            </div>
            <input
              type="number"
              placeholder="25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 font-mono text-[16px] text-[#E8E4DC] focus:border-[#E8B84B] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[1px] text-[#3A3A3A] font-500 mb-1.5">
              Credit Day
            </div>
            <input
              type="number"
              placeholder="1"
              value={creditDay}
              onChange={(e) => setCreditDay(e.target.value)}
              className="w-full h-12 bg-[#101010] border border-[#1E1E1E] rounded-xl px-4 font-mono text-[16px] text-[#E8E4DC] focus:border-[#E8B84B] focus:outline-none transition-colors"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 w-full h-[52px] bg-[#E8B84B] rounded-[13px] font-outfit text-[14px] font-600 text-[#0C0C0C] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {currentConfig && (
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] uppercase tracking-[1px] text-[#3A3A3A] mb-1">
                Monthly Stipend
              </div>
              <div className="font-mono text-[20px] font-600 text-[#E8E4DC]">
                ₹{Number(currentConfig.amount).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[1px] text-[#3A3A3A] mb-1">
                Credit Day
              </div>
              <div className="font-mono text-[20px] font-600 text-[#E8E4DC]">
                {currentConfig.credit_day}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

