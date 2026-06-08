'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2A2A2A] text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors duration-150"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  )
}
