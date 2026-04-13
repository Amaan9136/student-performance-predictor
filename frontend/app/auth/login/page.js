'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiUser, FiLock, FiCpu } from 'react-icons/fi'
import useAuthStore from '@/stores/authStore'
import { Spinner } from '@/components/ui'

export default function LoginPage() {
  const [form, setForm] = useState({ accountName: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    if (!form.accountName || !form.password) return toast.error('All fields required')
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      router.replace('/dashboard')
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
            <FiCpu size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Student Performance</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your faculty account</p>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="label">Account Name</label>
            <div className="relative">
              <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" placeholder="Enter name" value={form.accountName} onChange={set('accountName')} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </div>
          <button className="btn-primary w-full mt-2" onClick={submit} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Sign In'}
          </button>
        </div>
        <p className="text-center text-slate-500 text-sm mt-4">
          No account?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">Register</Link>
        </p>
        <p className="text-center text-slate-600 text-xs mt-2">
          <Link href="/admin/login" className="hover:text-slate-400 transition-colors">Admin login →</Link>
        </p>
      </div>
    </div>
  )
}
