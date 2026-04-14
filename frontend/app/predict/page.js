'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiCpu, FiCheckCircle, FiClock } from 'react-icons/fi'
import useStudentStore from '@/stores/studentStore'
import usePredictionStore from '@/stores/predictionStore'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/layout/PageHeader'
import { Spinner, Badge } from '@/components/ui'
function PredictContent() {
  const { students, fetchStudents } = useStudentStore()
  const { predict } = usePredictionStore()
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  useEffect(() => { fetchStudents() }, [])
  const unpredicted = students.filter(s => !s.latestPrediction)
  const predicted = students.filter(s => s.latestPrediction)
  const runAll = async () => {
    const targets = unpredicted
    if (!targets.length) { toast('All students already have predictions'); return }
    setRunning(true)
    setResults([])
    setProgress({ done: 0, total: targets.length })
    const newResults = []
    for (const s of targets) {
      try {
        const res = await predict(s.id)
        newResults.push({ ...s, result: res, ok: true })
      } catch {
        newResults.push({ ...s, ok: false })
      }
      setProgress(p => ({ ...p, done: p.done + 1 }))
      setResults([...newResults])
    }
    toast.success(`${newResults.filter(r => r.ok).length} predictions complete!`)
    fetchStudents()
    setRunning(false)
  }
  const runOne = async (s) => {
    try {
      const res = await predict(s.id)
      toast.success(`Predicted: ${res.grade} (${res.score?.toFixed(1)}%)`)
      fetchStudents()
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Prediction failed')
    }
  }
  return (
    <div className="page-container">
      <PageHeader title="Run Predictions" />
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-semibold">{unpredicted.length} students need prediction</p>
            <p className="text-slate-500 text-xs">{predicted.length} already predicted</p>
          </div>
          <button className="btn-primary text-sm px-4 py-2" onClick={runAll} disabled={running || !unpredicted.length}>
            {running ? <Spinner size="sm" /> : <><FiCpu size={14} /> Predict All</>}
          </button>
        </div>
        {running && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span><span>{progress.done}/{progress.total}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1"><FiCheckCircle size={14} className="text-emerald-400" /> Results</h3>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id}>
                      <td className="text-white font-medium">{r.name}</td>
                      <td className="text-slate-400">{r.rollNo}</td>
                      <td className="text-slate-400">{r.subject}</td>
                      <td className="text-slate-300">{r.ok ? `${r.result?.score?.toFixed(1)}%` : <span className="text-red-400 text-xs">Failed</span>}</td>
                      <td>{r.ok ? <Badge type={r.result?.grade}>{r.result?.grade}</Badge> : '—'}</td>
                      <td>{r.ok ? <Badge type={r.result?.risk}>{r.result?.risk}</Badge> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {unpredicted.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1"><FiClock size={14} className="text-yellow-400" /> Pending</h3>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {unpredicted.map(s => (
                    <tr key={s.id}>
                      <td className="text-white font-medium">{s.name}</td>
                      <td className="text-slate-400">{s.rollNo}</td>
                      <td className="text-slate-400">{s.subject}</td>
                      <td className="text-slate-300">{s.attendance}%</td>
                      <td className="text-slate-300">{s.avg_internal?.toFixed(1)}</td>
                      <td className="text-slate-300">{s.assignmentScore}</td>
                      <td>
                        <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => runOne(s)}>
                          <FiCpu size={12} /> Predict
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {predicted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1"><FiCheckCircle size={14} className="text-emerald-400" /> Already Predicted</h3>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {predicted.map(s => (
                    <tr key={s.id} className="opacity-70">
                      <td className="text-white font-medium">{s.name}</td>
                      <td className="text-slate-400">{s.rollNo}</td>
                      <td className="text-slate-400">{s.subject}</td>
                      <td className="text-slate-300">{s.latestPrediction?.score?.toFixed(1)}%</td>
                      <td><Badge type={s.latestPrediction?.grade}>{s.latestPrediction?.grade}</Badge></td>
                      <td><Badge type={s.latestPrediction?.risk}>{s.latestPrediction?.risk}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default function PredictPage() {
  return <AppLayout><PredictContent /></AppLayout>
}