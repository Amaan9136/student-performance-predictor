'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'
import { PageLoader } from '@/components/ui'

export default function AppLayout({ children, adminOnly = false }) {
  const { user, isAdmin, hasHydrated, fetchMe } = useAuthStore()
  const router = useRouter()
  useEffect(() => {
    fetchMe().then(u => {
      if (!u) { router.replace('/auth/login'); return }
      if (adminOnly && !isAdmin) router.replace('/dashboard')
    })
  }, [])
  if (!hasHydrated) return <PageLoader />
  if (!user) return <PageLoader />
  return <>{children}</>
}
