'use client'
import { FiUsers, FiUser, FiCpu, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import { adminAPI } from '@/services/api'
import { useAsync } from '@/hooks'
import { Spinner, StatCard, Badge } from '@/components/ui'

const GRADE_TEXT = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400' }

export default function AdminDashboardPage() {
  const { data, loading } = useAsync(() => adminAPI.dashboard(), [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const dist = data?.gradeDistribution || {}
  const recent = data?.recentPredictions || []

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">System overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={data?.totalStudents || 0} icon={<FiUsers />} accent="blue" />
        <StatCard label="Faculty Users" value={data?.totalUsers || 0} icon={<FiUser />} accent="purple" />
        <StatCard label="Predictions" value={data?.totalPredictions || 0} icon={<FiCpu />} accent="green" />
        <StatCard label="Avg Score" value={data?.avgPredictedScore ? `${data.avgPredictedScore}%` : '—'} icon={<FiTrendingUp />} accent="yellow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-4 flex items-center gap-1"><FiBarChart2 size={12} /> Grade Distribution</p>
          {Object.keys(dist).length === 0 ? (
            <p className="text-slate-600 text-sm">No predictions yet</p>
          ) : (
            <div className="space-y-3">
              {['A', 'B', 'C', 'D', 'F'].map(g => dist[g] ? (
                <div key={g} className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${GRADE_TEXT[g]}`}>Grade {g}</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round((dist[g] / data.totalPredictions) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{dist[g]}</span>
                </div>
              ) : null)}
            </div>
          )}
        </div>

        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-4">Recent Predictions</p>
          {recent.length === 0 ? (
            <p className="text-slate-600 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recent.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm text-white font-medium">{p.studentName}</p>
                    <p className="text-xs text-slate-500">{p.createdBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{p.score?.toFixed(1)}%</span>
                    <Badge type={p.grade}>{p.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
