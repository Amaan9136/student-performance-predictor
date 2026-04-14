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
        <input className="input pl-9 max-w-sm" placeholder="Search by name or roll no..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty message="No students found" icon={<FiUser />} />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Subject</th>
                  <th>Attendance</th>
                  <th>Avg Internal</th>
                  <th>Assignment</th>
                  <th>Grade</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/students/${s.id}`} className="text-white font-semibold hover:text-blue-400 transition-colors">{s.name}</Link>
                    </td>
                    <td className="text-slate-400">{s.rollNo}</td>
                    <td className="text-slate-400">{s.subject}</td>
                    <td className="text-slate-300">{s.attendance}%</td>
                    <td className="text-slate-300">{s.avg_internal?.toFixed(1)}</td>
                    <td className="text-slate-300">{s.assignmentScore}</td>
                    <td>{s.latestPrediction ? <Badge type={s.latestPrediction.grade}>{s.latestPrediction.grade}</Badge> : <span className="text-xs text-slate-600">—</span>}</td>
                    <td>{s.latestPrediction ? <Badge type={s.latestPrediction.risk}>{s.latestPrediction.risk}</Badge> : <span className="text-xs text-slate-600">—</span>}</td>
                    <td>
                      <button onClick={() => del(s.id, s.name)} disabled={deleting === s.id} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        {deleting === s.id ? <Spinner size="sm" /> : <FiTrash2 size={14} />}
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

export default function StudentsPage() {
  return <AppLayout><StudentsContent /></AppLayout>
}