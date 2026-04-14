'use client'
import { FiUser, FiBook, FiCalendar, FiLogOut, FiShield } from 'react-icons/fi'
import useAuthStore from '@/stores/authStore'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/layout/PageHeader'
import { Spinner } from '@/components/ui'
import { useState } from 'react'
function ProfileContent() {
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const doLogout = async () => {
    setLoading(true)
    await logout()
  }
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  return (
    <div className="page-container">
      <PageHeader title="Profile" />
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="card mb-4 flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-600/40 flex items-center justify-center mb-4">
              <FiUser size={36} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{user?.accountName}</h2>
            <p className="text-slate-400 text-sm mt-1">{user?.subject || 'Faculty'}</p>
          </div>
          <button className="btn-danger w-full" onClick={doLogout} disabled={loading}>
            {loading ? <Spinner size="sm" /> : <><FiLogOut size={16} /> Sign Out</>}
          </button>
        </div>
        <div className="card space-y-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Account Details</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <FiUser size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Account Name</p>
              <p className="text-sm text-white font-medium">{user?.accountName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <FiBook size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Subject</p>
              <p className="text-sm text-white font-medium">{user?.subject || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <FiCalendar size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Member Since</p>
              <p className="text-sm text-white font-medium">{joined}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <FiShield size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm text-white font-medium capitalize">{user?.role || 'faculty'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function ProfilePage() {
  return <AppLayout><ProfileContent /></AppLayout>
}