'use client'
import { useState } from 'react'
import { FiSearch, FiUser, FiBook, FiCalendar } from 'react-icons/fi'
import { adminAPI } from '@/services/api'
import { useAsync } from '@/hooks'
import { Spinner, Empty } from '@/components/ui'
export default function AdminUsersPage() {
  const [q, setQ] = useState('')
  const { data: users, loading } = useAsync(() => adminAPI.users(), [])
  const filtered = (users || []).filter(u =>
    !q || u.accountName?.toLowerCase().includes(q.toLowerCase()) || u.subject?.toLowerCase().includes(q.toLowerCase())
  )
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Faculty Users</h1>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} registered faculty</p>
      </div>
      <div className="relative mb-4">
        <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9 max-w-sm" placeholder="Search by name or subject..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty message="No faculty users found" icon={<FiUser />} />
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="card-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0">
                <FiUser size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{u.accountName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {u.subject && (
                    <span className="text-xs text-slate-500 flex items-center gap-1"><FiBook size={10} />{u.subject}</span>
                  )}
                  {u.createdAt && (
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <FiCalendar size={10} />{new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded-lg capitalize">{u.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
