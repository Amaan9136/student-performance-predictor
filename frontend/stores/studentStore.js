import { create } from 'zustand'
import { studentAPI } from '@/services/api'
const useStudentStore = create((set, get) => ({
  students: [],
  loading: false,
  fetchStudents: async (q) => {
    set({ loading: true })
    try {
      const res = await studentAPI.list(q)
      set({ students: res.data.data || [] })
    } finally {
      set({ loading: false })
    }
  },
  addStudent: async (data) => {
    const res = await studentAPI.add(data)
    set(s => ({ students: [res.data.data, ...s.students] }))
    return res.data.data
  },
  removeStudent: async (id) => {
    await studentAPI.remove(id)
    set(s => ({ students: s.students.filter(x => x.id !== id) }))
  },
  updateStudent: async (id, data) => {
    const res = await studentAPI.update(id, data)
    set(s => ({ students: s.students.map(x => x.id === id ? res.data.data : x) }))
    return res.data.data
  },
}))
export default useStudentStore
