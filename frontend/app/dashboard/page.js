'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp, FiCpu, FiClock } from 'react-icons/fi'
import useAuthStore from '@/stores/authStore'
import usePredictionStore from '@/stores/predictionStore'
import useStudentStore from '@/stores/studentStore'
import { PageLoader, StatCard, Badge, Spinner } from '@/components/ui'
import PageHeader from '@/components/layout/PageHeader'
import AppLayout from '@/components/layout/AppLayout'

function DashboardContent() {
  const { user } = useAuthStore()
  const { students, fetchStudents } = useStudentStore()
  const { history, fetchHistory } = usePredictionStore()
  const [running, setRunning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
    fetchHistory()
  }, [])

  const atRisk = students.filter(s => s.latestPrediction?.risk === 'high').length
  const avgScore = history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0
  const avgAttendance = students.length ? Math.round(students.reduce((a, b) => a + (b.attendance || 0), 0) / students.length) : 0

  const runAllPredictions = async () => {
    const unpredicted = students.filter(s => !s.latestPrediction)
    if (!unpredicted.length) { toast('All students already have predictions'); return }
    setRunning(true)
    try {
      const { predictionAPI } = await import('@/services/api')
      let count = 0
      for (const s of unpredicted) {
        await predictionAPI.predict({ studentId: s.id })
        count++
      }
      toast.success(`${count} predictions run!`)
      fetchStudents()
      fetchHistory()
    } catch (e) {
      toast.error('Some predictions failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Hello, ${user?.accountName || 'Faculty'} 👋`}
        action={
          <button className="btn-primary text-sm px-4 py-2" onClick={runAllPredictions} disabled={running}>
            {running ? <Spinner size="sm" /> : <><FiCpu size={14} /> Run All</>}
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Students" value={students.length} icon={<FiUsers />} accent="blue" />
        <StatCard label="At Risk" value={atRisk} icon={<FiAlertTriangle />} accent="red" sub="high risk" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} icon={<FiActivity />} accent="green" />
        <StatCard label="Avg Score" value={avgScore ? `${avgScore}%` : '—'} icon={<FiTrendingUp />} accent="purple" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><FiClock size={14} /> Recent Predictions</h2>
        <Link href="/predict" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-8">
          <FiCpu size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No predictions yet. Add students and run predictions.</p>
          <Link href="/students/add" className="btn-primary text-sm mt-4 inline-flex">Add Student</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history.slice(0, 8).map(p => (
            <div key={p.id} className="card-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{p.studentName}</p>
                <p className="text-xs text-slate-500">{p.subject} · {p.rollNo}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300">{p.score?.toFixed(1)}%</span>
                <Badge type={p.grade}>{p.grade}</Badge>
                <Badge type={p.risk}>{p.risk}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/students/add" className="card-sm flex flex-col items-center gap-2 py-4 hover:border-blue-800 transition-colors cursor-pointer">
          <FiUsers size={20} className="text-blue-400" />
          <span className="text-xs text-slate-300 font-medium">Add Student</span>
        </Link>
        <Link href="/reports" className="card-sm flex flex-col items-center gap-2 py-4 hover:border-blue-800 transition-colors cursor-pointer">
          <FiTrendingUp size={20} className="text-emerald-400" />
          <span className="text-xs text-slate-300 font-medium">View Reports</span>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <AppLayout><DashboardContent /></AppLayout>
}
