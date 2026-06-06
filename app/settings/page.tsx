'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const [amount, setAmount] = useState('')
  const [creditDay, setCreditDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
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

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/stipend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          credit_day: Number(creditDay)
        })
      })

      if (!res.ok) throw new Error('Failed to save config')

      setMessage({ type: 'success', text: 'Stipend configuration saved successfully!' })
      fetchCurrentConfig()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-3xl">
      <div>
        <h1 className="swiss-page-heading border-b-4 border-[#FF3000] inline-block pb-2">
          SETTINGS
        </h1>
      </div>

      <div className="space-y-10">
        <div>
          <p className="swiss-section-label">01. STIPEND CONFIG</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-black">
                  Monthly Stipend Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditDay" className="text-xs font-bold uppercase tracking-widest text-black">
                  Stipend Credit Day (1–31)
                </Label>
                <Input
                  id="creditDay"
                  type="number"
                  placeholder="e.g., 1"
                  value={creditDay}
                  onChange={(e) => setCreditDay(e.target.value)}
                  min="1"
                  max="31"
                />
              </div>
            </div>

            {message && (
              <div className={`border-l-4 p-3 text-xs uppercase tracking-widest font-bold ${
                message.type === 'success'
                  ? 'border-black bg-[#F2F2F2] text-black'
                  : 'border-[#FF3000] bg-[#F2F2F2] text-[#FF3000]'
              }`}>
                {message.text}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || !amount || !creditDay}
              className="w-full h-14 md:h-16"
              size="lg"
            >
              {loading ? 'Saving...' : 'Save Config'}
            </Button>
          </div>
        </div>

        {currentConfig && (
          <div>
            <p className="swiss-section-label">CURRENT CONFIG</p>
            <div className="border-4 border-black p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-1">
                  Monthly Stipend
                </p>
                <p className="font-black text-3xl tracking-tighter">
                  ₹{Number(currentConfig.amount).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-[#FF3000] mb-1">
                  Credit Day
                </p>
                <p className="font-black text-3xl tracking-tighter">
                  {currentConfig.credit_day}
                  <span className="text-lg font-bold uppercase tracking-widest ml-1">
                    {getOrdinalSuffix(currentConfig.credit_day)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getOrdinalSuffix(n: number) {
  const s = ['TH', 'ST', 'ND', 'RD']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
