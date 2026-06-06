'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, Tags, ReceiptText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Add Balance', href: '/balance', icon: PlusCircle },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Expenses', href: '/expenses', icon: ReceiptText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const today = format(new Date(), 'EEEE, MMMM d, yyyy').toUpperCase()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-black border-r-4 border-black sticky top-0 shrink-0">
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            PAISATRACK
          </h1>
          <div className="border-b-2 border-[#FF3000] mt-3" />
        </div>

        <div className="px-6 pt-6 pb-2">
          <p className="text-[10px] tracking-widest uppercase text-[#FF3000] font-bold">
            01. NAVIGATION
          </p>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block w-full py-4 px-6 text-xs font-bold uppercase tracking-widest transition-colors duration-150',
                  isActive
                    ? 'bg-[#FF3000] text-black'
                    : 'text-white hover:bg-white hover:text-black'
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-6 border-t-2 border-white/20">
          <p className="text-xs uppercase tracking-widest text-white/50">{today}</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t-2 border-black flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-3 px-2 min-w-[44px] min-h-[44px] transition-colors duration-150',
                isActive
                  ? 'text-white border-t-2 border-[#FF3000]'
                  : 'text-white border-t-2 border-transparent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {item.name.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
