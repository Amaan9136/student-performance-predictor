'use client'
import { useEffect } from 'react'
import { FiBarChart2, FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp } from 'react-icons/fi'
import { predictionAPI } from '@/services/api'
import { useAsync } from '@/hooks'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/layout/PageHeader'
import { Spinner, StatCard } from '@/components/ui'
const GRADE_COLORS = { A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-yellow-500', D: 'bg-orange-500', F: 'bg-red-500' }
const GRADE_TEXT = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400' }
function GradeBar({ grade, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-bold w-4 ${GRADE_TEXT[grade]}`}>{grade}</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${GRADE_COLORS[grade]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-16 text-right">{count} <span className="text-slate-600">({pct}%)</span></span>
    </div>
  )
}
function ReportsContent() {
  const { data: report, loading } = useAsync(() => predictionAPI.reportAll(), [])
  if (loading) return (
    <div className="page-container">
      <PageHeader title="Reports" />
      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    </div>
  )
  const dist = report?.gradeDistribution || {}
  const risk = report?.riskDistribution || {}
  const total = report?.total || 0
  const grades = ['A', 'B', 'C', 'D', 'F']
  return (
    <div className="page-container">
      <PageHeader title="Analytics & Reports" />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Predictions" value={total} icon={<FiBarChart2 />} accent="blue" />
        <StatCard label="Avg Score" value={report?.avgScore ? `${report.avgScore}%` : '—'} icon={<FiTrendingUp />} accent="purple" />
        <StatCard label="Avg Attendance" value={report?.avgAttendance ? `${report.avgAttendance}%` : '—'} icon={<FiActivity />} accent="green" />
        <StatCard label="At Risk" value={risk.high || 0} icon={<FiAlertTriangle />} accent="red" sub="high risk students" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-4 flex items-center gap-1"><FiBarChart2 size={12} /> Grade Distribution</p>
          {total === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">No predictions yet</p>
          ) : (
            <div className="space-y-3">
              {grades.map(g => <GradeBar key={g} grade={g} count={dist[g] || 0} total={total} />)}
            </div>
          )}
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-4 flex items-center gap-1"><FiAlertTriangle size={12} /> Risk Distribution</p>
          {total === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">No predictions yet</p>
          ) : (
            <div className="space-y-3">
              {[['low', 'bg-emerald-500', 'text-emerald-400'], ['medium', 'bg-yellow-500', 'text-yellow-400'], ['high', 'bg-red-500', 'text-red-400']].map(([r, bg, text]) => (
                <div key={r} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-14 capitalize ${text}`}>{r}</span>
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${bg} rounded-full transition-all duration-700`} style={{ width: `${total ? Math.round(((risk[r] || 0) / total) * 100) : 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right">{risk[r] || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Grade Scale</p>
        <div className="space-y-1.5">
          {[['A', '≥75%', 'Excellent'], ['B', '60–74%', 'Good'], ['C', '50–59%', 'Average'], ['D', '40–49%', 'Below Average'], ['F', '<40%', 'Fail']].map(([g, range, label]) => (
            <div key={g} className="flex items-center justify-between text-xs">
              <span className={`font-bold w-4 ${GRADE_TEXT[g]}`}>{g}</span>
              <span className="text-slate-400 flex-1 ml-3">{label}</span>
              <span className="text-slate-500">{range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default function ReportsPage() {
  return <AppLayout><ReportsContent /></AppLayout>
}