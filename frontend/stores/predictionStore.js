import { create } from 'zustand'
import { predictionAPI } from '@/services/api'
const usePredictionStore = create((set, get) => ({
  history: [],
  loading: false,
  fetchHistory: async () => {
    set({ loading: true })
    try {
      const res = await predictionAPI.history()
      set({ history: res.data.data || [] })
    } finally {
      set({ loading: false })
    }
  },
  predict: async (studentId) => {
    const res = await predictionAPI.predict({ studentId })
    return res.data.data
  },
  aiAdvice: async (studentId) => {
    const res = await predictionAPI.aiAdvice({ studentId })
    return res.data.data.advice
  },
}))
export default usePredictionStore
