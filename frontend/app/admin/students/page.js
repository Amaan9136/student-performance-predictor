'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiSearch, FiTrash2 } from 'react-icons/fi'
import { adminAPI } from '@/services/api'
import { useAsync } from '@/hooks'
import { Spinner, Empty, Badge } from '@/components/ui'

export default function AdminStudentsPage() {
  const [q, setQ] = useState('')
  const { data: students, loading, refetch } = useAsync(() => adminAPI.students(), [])
  const [deleting, setDeleting] = useState(null)

  const filtered = (students || []).filter(s =>
    !q || s.name?.toLowerCase().includes(q.toLowerCase()) || s.rollNo?.toLowerCase().includes(q.toLowerCase()) || s.subject?.toLowerCase().includes(q.toLowerCase())
  )

  const del = async (id, name) => {
    if (!confirm(`Delete ${name} and all their predictions?`)) return
    setDeleting(id)
    try {
      await adminAPI.deleteStudent(id)
      toast.success('Student deleted')
      refetch()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Students</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} records</p>
        </div>
      </div>
      <div className="relative mb-4">
        <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9 max-w-sm" placeholder="Search name, roll, subject..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty message="No students found" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Subject</th>
                  <th>Att%</th>
                  <th>Avg Int</th>
                  <th>Assignment</th>
                  <th>Prediction</th>
                  <th>Faculty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="text-white font-medium">{s.name}</td>
                    <td className="text-slate-400">{s.rollNo}</td>
                    <td className="text-slate-400">{s.subject}</td>
                    <td className="text-slate-300">{s.attendance}%</td>
                    <td className="text-slate-300">{s.avg_internal?.toFixed(1)}</td>
                    <td className="text-slate-300">{s.assignmentScore}</td>
                    <td>
                      {s.latestPrediction ? (
                        <div className="flex items-center gap-1">
                          <Badge type={s.latestPrediction.grade}>{s.latestPrediction.grade}</Badge>
                          <span className="text-xs text-slate-500">{s.latestPrediction.score?.toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-xs text-slate-600">—</span>}
                    </td>
                    <td className="text-slate-500 text-xs">{s.createdBy}</td>
                    <td>
                      <button onClick={() => del(s.id, s.name)} disabled={deleting === s.id} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        {deleting === s.id ? <Spinner size="sm" /> : <FiTrash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}