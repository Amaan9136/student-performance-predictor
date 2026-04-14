'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiCpu, FiMessageSquare, FiActivity, FiClipboard, FiBook, FiPercent, FiRefreshCw } from 'react-icons/fi'
import { studentAPI } from '@/services/api'
import usePredictionStore from '@/stores/predictionStore'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/layout/PageHeader'
import { Spinner, Badge, PageLoader } from '@/components/ui'

function GradeBar({ label, value, max = 100, color = 'bg-blue-500' }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span><span className="font-medium text-white">{value}{max === 100 ? '%' : `/${max}`}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StudentDetailContent() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [adviceLoading, setAdviceLoading] = useState(false)
  const [advice, setAdvice] = useState('')
  const { predict, aiAdvice } = usePredictionStore()

  const load = async () => {
    try {
      const res = await studentAPI.get(id)
      setStudent(res.data.data)
    } catch { toast.error('Failed to load student') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const runPredict = async () => {
    setPredicting(true)
    try {
      await predict(id)
      toast.success('Prediction updated!')
      load()
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Prediction failed')
    } finally { setPredicting(false) }
  }

  const getAdvice = async () => {
    setAdviceLoading(true)
    setAdvice('')
    try {
      const text = await aiAdvice(id)
      setAdvice(text)
    } catch (e) {
      setAdvice(e?.response?.data?.msg || 'Failed to get AI advice. Ensure Ollama is running.')
    } finally { setAdviceLoading(false) }
  }

  if (loading) return <PageLoader />
  if (!student) return <div className="page-container"><p className="text-slate-500 text-center mt-12">Student not found</p></div>

  const p = student.latestPrediction
  const avgInternal = student.avg_internal || (student.internalMarks?.reduce((a, b) => a + b, 0) / 3) || 0

  return (
    <div className="page-container">
      <PageHeader title={student.name} back />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-white">{student.name}</p>
              <p className="text-slate-400 text-sm">{student.rollNo} · {student.subject}</p>
            </div>
            <button className="btn-secondary text-xs px-3 py-2" onClick={runPredict} disabled={predicting}>
              {predicting ? <Spinner size="sm" /> : <><FiRefreshCw size={12} /> Predict</>}
            </button>
          </div>
          <div className="space-y-3">
            <GradeBar label="Attendance" value={student.attendance} color="bg-blue-500" />
            <GradeBar label="Avg Internal Marks" value={avgInternal.toFixed(1)} color="bg-purple-500" />
            <GradeBar label="Assignment Score" value={student.assignmentScore} color="bg-emerald-500" />
          </div>
          {student.internalMarks && (
            <div className="flex gap-2 mt-4">
              {student.internalMarks.map((m, i) => (
                <div key={i} className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Test {i + 1}</p>
                  <p className="text-sm font-bold text-white">{m}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {p ? (
            <div className="card mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3 flex items-center gap-1"><FiActivity size={12} /> Prediction Result</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl font-black text-white">{p.score?.toFixed(1)}<span className="text-lg text-slate-400">%</span></div>
                <div className="flex flex-col gap-1">
                  <Badge type={p.grade}>Grade {p.grade}</Badge>
                  <Badge type={p.risk}>{p.risk} risk</Badge>
                </div>
              </div>
              <GradeBar label="Predicted Score" value={p.score?.toFixed(1)} color={p.score >= 60 ? 'bg-emerald-500' : p.score >= 45 ? 'bg-yellow-500' : 'bg-red-500'} />
            </div>
          ) : (
            <div className="card mb-4 text-center py-6">
              <FiCpu size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm mb-3">No prediction yet</p>
              <button className="btn-primary text-sm" onClick={runPredict} disabled={predicting}>
                {predicting ? <Spinner size="sm" /> : 'Run Prediction'}
              </button>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium flex items-center gap-1"><FiMessageSquare size={12} /> AI Advisor</p>
              <button className="btn-secondary text-xs px-3 py-1.5" onClick={getAdvice} disabled={adviceLoading || !p}>
                {adviceLoading ? <Spinner size="sm" /> : 'Get Advice'}
              </button>
            </div>
            {!p && <p className="text-slate-600 text-xs">Run a prediction first to get AI advice.</p>}
            {adviceLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Spinner size="sm" /><span>Asking AI advisor...</span>
              </div>
            )}
            {advice && !adviceLoading && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <p className="text-slate-300 text-sm leading-relaxed">{advice}</p>
              </div>
            )}
            {!advice && !adviceLoading && p && (
              <p className="text-slate-600 text-xs">Click "Get Advice" for personalized AI recommendations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentDetailPage() {
  return <AppLayout><StudentDetailContent /></AppLayout>
}