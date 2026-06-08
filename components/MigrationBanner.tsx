'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function MigrationBanner() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show banner if not previously dismissed in this session
    const wasDismissed = sessionStorage.getItem('migration-dismissed')
    if (!wasDismissed) setShow(true)
  }, [])

  const handleMigrate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/migrate', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        const total = Object.values(data.migrated as Record<string, number>).reduce((a, b) => a + b, 0)
        if (total > 0) {
          toast.success(`Migrated ${total} existing records to your account!`)
        } else {
          toast.success('All data is already linked to your account.')
        }
        sessionStorage.setItem('migration-dismissed', '1')
        setShow(false)
      }
    } catch {
      toast.error('Migration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem('migration-dismissed', '1')
    setShow(false)
    setDismissed(true)
  }

  if (!show || dismissed) return null

  return (
    <div className="flex items-center gap-3 bg-[#1C1600] border border-[#E8B84B]/20 rounded-xl px-4 py-3 text-sm">
      <span className="text-lg">📦</span>
      <p className="flex-1 text-muted-foreground">
        You have existing data — <button onClick={handleMigrate} disabled={loading} className="text-[#E8B84B] font-medium hover:underline disabled:opacity-50">
          {loading ? 'Claiming...' : 'click here to claim it'}
        </button> for your account.
      </p>
      <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground text-xs ml-2">✕</button>
    </div>
  )
}
