'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiGrid, FiUsers, FiCpu, FiBarChart2, FiUser } from 'react-icons/fi'

const tabs = [
  { href: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { href: '/students', icon: FiUsers, label: 'Students' },
  { href: '/predict', icon: FiCpu, label: 'Predict' },
  { href: '/reports', icon: FiBarChart2, label: 'Reports' },
  { href: '/profile', icon: FiUser, label: 'Profile' },
]

export default function BottomNav() {
  const path = usePathname()
  const isAdmin = path.startsWith('/admin')
  const isAuth = path.startsWith('/auth')
  if (isAdmin || isAuth) return null
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
