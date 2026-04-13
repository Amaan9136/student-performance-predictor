'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiSearch, FiPlus, FiTrash2, FiUser } from 'react-icons/fi'
import useStudentStore from '@/stores/studentStore'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/layout/PageHeader'
import { Spinner, Empty, Badge } from '@/components/ui'

function StudentsContent() {
  const { students, loading, fetchStudents, removeStudent } = useStudentStore()
  const [q, setQ] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchStudents() }, [])

  const filtered = students.filter(s =>
    !q || s.name?.toLowerCase().includes(q.toLowerCase()) || s.rollNo?.toLowerCase().includes(q.toLowerCase())
  )

  const del = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    setDeleting(id)
    try {
      await removeStudent(id)
      toast.success('Student removed')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Students"
        action={
          <Link href="/students/add" className="btn-primary text-sm px-4 py-2">
            <FiPlus size={14} /> Add
          </Link>
        }
      />
      <div className="relative mb-4">
        <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search by name or roll no..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty message="No students found" icon={<FiUser />} />
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="card-sm flex items-center gap-3">
              <Link href={`/students/${s.id}`} className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.rollNo} · {s.subject}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Att: <span className="text-white font-medium">{s.attendance}%</span></span>
                      <span className="text-xs text-slate-400">Avg: <span className="text-white font-medium">{s.avg_internal?.toFixed(1)}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {s.latestPrediction ? (
                      <>
                        <Badge type={s.latestPrediction.grade}>{s.latestPrediction.grade}</Badge>
                        <Badge type={s.latestPrediction.risk}>{s.latestPrediction.risk}</Badge>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600">No prediction</span>
                    )}
                  </div>
                </div>
              </Link>
              <button onClick={() => del(s.id, s.name)} disabled={deleting === s.id} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
                {deleting === s.id ? <Spinner size="sm" /> : <FiTrash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StudentsPage() {
  return <AppLayout><StudentsContent /></AppLayout>
}
