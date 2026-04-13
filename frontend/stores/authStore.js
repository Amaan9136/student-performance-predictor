import { create } from 'zustand'
import { authAPI, setApiToken } from '@/services/api'
const ME_TTL = 2 * 60 * 1000
const useAuthStore = create((set, get) => ({
  user: null,
  isAdmin: false,
  hasHydrated: false,
  meFetchedAt: 0,
  login: async (data) => {
    const res = await authAPI.login(data)
    const { user, token } = res.data.data
    if (token) setApiToken(token)
    set({ user, isAdmin: false, hasHydrated: true, meFetchedAt: Date.now() })
    return res
  },
  adminLogin: async (data) => {
    const res = await authAPI.adminLogin(data)
    const { admin, token } = res.data.data
    if (token) setApiToken(token)
    set({ user: admin, isAdmin: true, hasHydrated: true, meFetchedAt: Date.now() })
    return res
  },
  register: async (data) => {
    const res = await authAPI.register(data)
    const { user, token } = res.data.data
    if (token) setApiToken(token)
    set({ user, isAdmin: false, hasHydrated: true, meFetchedAt: Date.now() })
    return res
  },
  fetchMe: async (force = false) => {
    const { user, meFetchedAt } = get()
    if (!force && user && Date.now() - meFetchedAt < ME_TTL) return user
    try {
      const res = await authAPI.me()
      const u = res.data.data
      const isAdmin = u?.role === 'admin'
      set({ user: u, isAdmin, hasHydrated: true, meFetchedAt: Date.now() })
      return u
    } catch {
      setApiToken(null)
      set({ user: null, isAdmin: false, hasHydrated: true })
      return null
    }
  },
  logout: async () => {
    const { isAdmin } = get()
    try { await authAPI.logout() } catch {}
    setApiToken(null)
    set({ user: null, isAdmin: false, hasHydrated: true, meFetchedAt: 0 })
    if (typeof window !== 'undefined') window.location.href = isAdmin ? '/admin/login' : '/auth/login'
  },
  setHasHydrated: (val) => set({ hasHydrated: val }),
}))
export default useAuthStore
