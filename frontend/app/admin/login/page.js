'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiShield, FiUser, FiLock } from 'react-icons/fi'
import useAuthStore from '@/stores/authStore'
import { Spinner } from '@/components/ui'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ accountName: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { adminLogin } = useAuthStore()
  const router = useRouter()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.accountName || !form.password) return toast.error('All fields required')
    setLoading(true)
    try {
      await adminLogin(form)
      toast.success('Admin access granted')
      router.replace('/admin')
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <FiShield size={28} className="text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Restricted access</p>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="label">Admin Username</label>
            <div className="relative">
              <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" placeholder="admin" value={form.accountName} onChange={set('accountName')} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </div>
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Sign In as Admin'}
          </button>
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">
          <Link href="/auth/login" className="hover:text-slate-400 transition-colors">← Faculty login</Link>
        </p>
      </div>
    </div>
  )
}
