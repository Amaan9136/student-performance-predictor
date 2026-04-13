'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'
import { PageLoader } from '@/components/ui'

export default function Home() {
  const { fetchMe } = useAuthStore()
  const router = useRouter()
  useEffect(() => {
    fetchMe().then(u => {
      if (u) router.replace('/dashboard')
      else router.replace('/auth/login')
    })
  }, [])
  return <PageLoader />
}
