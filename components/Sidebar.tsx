'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, LayoutDashboard, PlusCircle, Tags, ReceiptText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Add Balance', href: '/balance', icon: PlusCircle },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Expenses', href: '/expenses', icon: ReceiptText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r bg-card px-4 py-6 sticky top-0 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-8 text-primary">
          <Wallet className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight">PaisaTrack</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md flex justify-around p-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-md transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
