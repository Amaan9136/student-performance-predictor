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

export default function SideNav() {
  const path = usePathname()
  const isAdmin = path.startsWith('/admin')
  const isAuth = path.startsWith('/auth')
  if (isAdmin || isAuth) return null
  return (
    <nav className="sidebar">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <FiCpu size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Performance</p>
          <p className="text-xs text-slate-500">Predictor</p>
        </div>
      </div>
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}