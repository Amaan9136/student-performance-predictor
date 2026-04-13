'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiGrid, FiUsers, FiCpu, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi'
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
  const [sideOpen, setSideOpen] = useState(false)

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
    <div className="min-h-screen flex bg-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
            <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item) ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
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
      {sideOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSideOpen(false)} />}
      <div className="flex-1 lg:ml-60 min-h-screen">
        <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSideOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300">
            <FiMenu size={16} />
          </button>
          <span className="text-sm font-semibold text-white">Admin Panel</span>
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
