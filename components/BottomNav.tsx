'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Tag, Receipt, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Wallet', href: '/balance', icon: Wallet },
  { name: 'Tags', href: '/categories', icon: Tag },
  { name: 'Receipt', href: '/expenses', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0C0C0C] border-t border-[#181818] h-16 grid grid-cols-5">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150"
          >
            <item.icon
              size={20}
              strokeWidth={1.5}
              className={isActive ? "text-[#E8B84B]" : "text-[#2E2E2E]"}
            />
            <span
              className={cn(
                "text-[9px] uppercase tracking-[0.5px] font-500",
                isActive ? "text-[#E8B84B]" : "text-[#2E2E2E]"
              )}
            >
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
