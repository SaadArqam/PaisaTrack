'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Save } from 'lucide-react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Configure your stipend settings</p>
      </div>

      <div className="max-w-2xl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Stipend Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Stipend Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditDay">Stipend Credit Day (1-31)</Label>
                <Input
                  id="creditDay"
                  type="number"
                  placeholder="e.g., 1 for 1st of the month"
                  value={creditDay}
                  onChange={(e) => setCreditDay(e.target.value)}
                  required
                  min="1"
                  max="31"
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  The day of the month when your stipend arrives
                </p>
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {message.text}
                </div>
              )}

              <Button type="submit" variant="default" disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>

            {currentConfig && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Current Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Stipend:</span>
                    <span className="font-medium">₹{Number(currentConfig.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Day:</span>
                    <span className="font-medium">{currentConfig.credit_day}{getOrdinalSuffix(currentConfig.credit_day)} of the month</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getOrdinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
