'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiGrid, FiUsers, FiCpu, FiUser, FiLogOut, FiShield } from 'react-icons/fi'
import useAuthStore from '@/stores/authStore'
import { PageLoader } from '@/components/ui'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
  { href: '/admin/students', label: 'Students', icon: FiUsers },
  { href: '/admin/users', label: 'Faculty', icon: FiUser },
  { href: '/admin/train', label: 'Train Model', icon: FiCpu },
]

export default function AdminLayout({ children }) {
  const { user, isAdmin, hasHydrated, fetchMe, logout } = useAuthStore()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (path === '/admin/login') return
    fetchMe().then(u => {
      if (!u) { router.replace('/admin/login'); return }
      if (u.role !== 'admin') router.replace('/dashboard')
    })
  }, [])

  if (path === '/admin/login') return <>{children}</>
  if (!hasHydrated) return <PageLoader />
  if (!user || !isAdmin) return <PageLoader />

  const isActive = (item) => item.exact ? path === item.href : path.startsWith(item.href)

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <FiShield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs text-slate-500">{user?.accountName}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item) ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>
              <item.icon size={16} />{item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors w-full">
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
      <div className="main-with-sidebar">
        <main className="page-container">{children}</main>
      </div>
    </div>
  )
}