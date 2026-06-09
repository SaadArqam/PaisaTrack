'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AddCategoryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💰')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        // Format postgres unique constraint error
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>New Category</CardTitle>
        <CardDescription>Create a custom expense category</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMsg && (
          <Alert variant="destructive" className="mb-4 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{errorMsg}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries"
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '10px',
                color: '#E8E4DC',
                padding: '0 16px',
                height: '48px',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Emoji Icon</Label>
            <input
              id="icon"
              type="text"
              required
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🍔"
              maxLength={2}
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '10px',
                color: '#E8E4DC',
                padding: '0 16px',
                height: '48px',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#E8B84B',
              color: '#0C0C0C',
              border: 'none',
              borderRadius: '13px',
              height: '52px',
              width: '100%',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'var(--font-outfit)',
            }}
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
