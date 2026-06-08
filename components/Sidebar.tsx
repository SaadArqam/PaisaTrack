'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Tag, Receipt, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Add Balance', href: '/balance', icon: Wallet },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-14 min-h-screen bg-[#0C0C0C] border-r border-[#1E1E1E] sticky top-0 shrink-0">
      <div className="flex items-center justify-center py-5 mb-2">
        <span className="font-outfit font-700 text-sm text-[#E8B84B]">P</span>
      </div>

      <nav className="flex flex-col items-center gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                isActive
                  ? "text-[#E8B84B] bg-[#1C1600]"
                  : "text-[#2E2E2E] hover:text-[#555] hover:bg-[#161616]"
              )}
            >
              <item.icon size={20} strokeWidth={1.5} />
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col items-center pb-5">
        <Link
          href="/settings"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
            pathname === '/settings'
              ? "text-[#E8B84B] bg-[#1C1600]"
              : "text-[#2E2E2E] hover:text-[#555] hover:bg-[#161616]"
          )}
        >
          <Settings size={20} strokeWidth={1.5} />
        </Link>
      </div>
    </aside>
  )
}
