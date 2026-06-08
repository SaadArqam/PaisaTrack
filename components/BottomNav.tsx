'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Tag, Receipt, RefreshCw } from 'lucide-react'

const links = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/balance', icon: Wallet, label: 'Balance' },
  { href: '/categories', icon: Tag, label: 'Tags' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/recurring', icon: RefreshCw, label: 'Repeat' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-border"
      style={{ height: '60px', backgroundColor: '#0C0C0C' }}>
      {links.map(({ href, icon: Icon, label }) => {
        const active = path === href
        return (
          <Link key={href} href={href}
            className="flex flex-col items-center justify-center gap-1">
            <Icon size={20} strokeWidth={1.5}
              color={active ? '#E8B84B' : '#3A3A3A'} />
            <span className="text-[9px] uppercase tracking-wide font-medium"
              style={{ color: active ? '#E8B84B' : '#3A3A3A' }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
