'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiCpu, FiCheckCircle, FiInfo, FiBarChart2, FiRefreshCw } from 'react-icons/fi'
import { adminAPI } from '@/services/api'
import { Spinner } from '@/components/ui'
import { useAsync } from '@/hooks'

const GRADE_COLOR = { A: '#34d399', B: '#60a5fa', C: '#facc15', D: '#fb923c', F: '#f87171' }
const RISK_COLOR = { low: '#34d399', medium: '#facc15', high: '#f87171' }

function MiniBar({ label, value, max, color }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((value / max) * 100)}%`, background: color }} />
      </div>
      <span className="text-slate-300 w-6 text-right">{value}</span>
    </div>
  )
}

function ScatterDot({ x, y, color, label }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full opacity-70 hover:opacity-100 hover:scale-150 transition-all cursor-default"
      style={{ left: `${x}%`, bottom: `${y}%`, background: color, transform: 'translate(-50%, 50%)' }}
      title={label}
    />
  )
}

function ScatterPlot({ points, colorFn, labelFn, title, xKey = 'attendance', yKey = 'score' }) {
  if (!points?.length) return <p className="text-slate-600 text-xs text-center py-6">No data</p>
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{title}</p>
      <div className="relative h-36 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {points.map((p, i) => (
          <ScatterDot
            key={i}
            x={Math.min(99, Math.max(1, p[xKey]))}
            y={Math.min(99, Math.max(1, p[yKey]))}
            color={colorFn(p)}
            label={labelFn(p)}
          />
        ))}
        <span className="absolute bottom-1 left-2 text-[10px] text-slate-700">{xKey === 'attendance' ? 'Attendance →' : xKey}</span>
        <span className="absolute top-1 left-2 text-[10px] text-slate-700">Score ↑</span>
      </div>
    </div>
  )
}

function VizSection({ viz, loading: vizLoading, refetch: refetchViz }) {
  const [tab, setTab] = useState('scatter')
  if (vizLoading) return <div className="flex justify-center py-8"><Spinner size="lg" /></div>
  if (!viz) return null

  const train = viz.train || []
  const test = viz.test || []
  const preds = viz.predictions || []

  const gradeCount = (arr) => arr.reduce((acc, p) => { acc[p.grade || _grade(p.score)] = (acc[p.grade || _grade(p.score)] || 0) + 1; return acc }, {})
  const _grade = s => s >= 75 ? 'A' : s >= 60 ? 'B' : s >= 50 ? 'C' : s >= 40 ? 'D' : 'F'

  const trainGrades = gradeCount(train)
  const testGrades = gradeCount(test)
  const predGrades = gradeCount(preds)
  const maxGrade = Math.max(...['A','B','C','D','F'].map(g => Math.max(trainGrades[g]||0, testGrades[g]||0, predGrades[g]||0)), 1)

  const avgScore = arr => arr.length ? (arr.reduce((s,p) => s + p.score, 0) / arr.length).toFixed(1) : '—'
  const avgAtt = arr => arr.length ? (arr.reduce((s,p) => s + p.attendance, 0) / arr.length).toFixed(1) : '—'

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium flex items-center gap-1.5"><FiBarChart2 size={12} /> Data Visualisation</p>
        <button onClick={refetchViz} className="text-slate-600 hover:text-slate-400 transition-colors"><FiRefreshCw size={13} /></button>
      </div>

      <div className="flex gap-1 mb-4">
        {[['scatter', 'Scatter'], ['grades', 'Grades'], ['stats', 'Stats']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'scatter' && (
        <div className="space-y-4">
          <div className="flex gap-3 text-[10px] text-slate-500 flex-wrap">
            {Object.entries(GRADE_COLOR).map(([g, c]) => (
              <span key={g} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} /> Grade {g}</span>
            ))}
          </div>
          <ScatterPlot points={train} colorFn={p => GRADE_COLOR[_grade(p.score)]} labelFn={p => `Att: ${p.attendance.toFixed(1)} Score: ${p.score.toFixed(1)}`} title={`Train data (${train.length} pts) — Attendance vs Score`} />
          <ScatterPlot points={test} colorFn={p => GRADE_COLOR[_grade(p.score)]} labelFn={p => `Att: ${p.attendance.toFixed(1)} Score: ${p.score.toFixed(1)}`} title={`Test data (${test.length} pts) — Attendance vs Score`} />
          {preds.length > 0 && (
            <ScatterPlot points={preds} colorFn={p => RISK_COLOR[p.risk] || '#94a3b8'} labelFn={p => `${p.name} — Score: ${p.score.toFixed(1)} Risk: ${p.risk}`} title={`Real predictions (${preds.length} pts) — colored by risk`} />
          )}
        </div>
      )}

      {tab === 'grades' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">Train ({train.length})</p>
            <div className="space-y-1.5">
              {['A','B','C','D','F'].map(g => <MiniBar key={g} label={`Grade ${g}`} value={trainGrades[g]||0} max={maxGrade} color={GRADE_COLOR[g]} />)}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">Test ({test.length})</p>
            <div className="space-y-1.5">
              {['A','B','C','D','F'].map(g => <MiniBar key={g} label={`Grade ${g}`} value={testGrades[g]||0} max={maxGrade} color={GRADE_COLOR[g]} />)}
            </div>
          </div>
          {preds.length > 0 && (
            <div>
              <p className="text-xs text-slate-600 mb-2">Predictions ({preds.length})</p>
              <div className="space-y-1.5">
                {['A','B','C','D','F'].map(g => <MiniBar key={g} label={`Grade ${g}`} value={predGrades[g]||0} max={maxGrade} color={GRADE_COLOR[g]} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-3">
          {[
            { label: 'Train', count: train.length, avg: avgScore(train), att: avgAtt(train), color: 'text-blue-400' },
            { label: 'Test', count: test.length, avg: avgScore(test), att: avgAtt(test), color: 'text-purple-400' },
            { label: 'Real Predictions', count: preds.length, avg: avgScore(preds), att: avgAtt(preds), color: 'text-emerald-400' },
          ].map(row => (
            <div key={row.label} className="bg-slate-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className={`text-sm font-semibold ${row.color}`}>{row.label}</span>
              <div className="flex gap-6 text-xs text-slate-400">
                <span><span className="text-slate-600">n=</span>{row.count}</span>
                <span><span className="text-slate-600">avg score=</span>{row.avg}</span>
                <span><span className="text-slate-600">avg att=</span>{row.att}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminTrainPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { data: viz, loading: vizLoading, refetch: refetchViz } = useAsync(() => adminAPI.vizData(), [])

  const train = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await adminAPI.trainModel()
      setResult(res.data.data)
      toast.success('Model retrained successfully!')
      refetchViz()
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Training failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Train ML Model</h1>
        <p className="text-slate-400 text-sm mt-1">Retrain the prediction model on all available data</p>
      </div>

      <div className="card mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
            <FiCpu size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold">RandomForest Regressor</p>
            <p className="text-slate-400 text-sm mt-0.5">scikit-learn model trained on attendance, internal marks, and assignment scores</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 mb-4 space-y-1.5">
          {[['Algorithm', 'RandomForestRegressor (n=100)'], ['Fallback', 'LinearRegression (<20 samples)'], ['Bootstrap', '200 synthetic samples on first run'], ['Features', 'Attendance, Avg Internal, Assignment Score'], ['Output', 'Predicted Score → Grade + Risk Level']].map(([k, v]) => (
            <div key={k} className="flex gap-3 text-xs">
              <span className="text-slate-500 w-20 shrink-0">{k}</span>
              <span className="text-slate-300">{v}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary w-full" onClick={train} disabled={loading}>
          {loading ? <><Spinner size="sm" /> Training...</> : <><FiCpu size={16} /> Retrain Model</>}
        </button>
      </div>

      {result && (
        <div className="card border-emerald-800/50 bg-emerald-950/20">
          <div className="flex items-center gap-2 mb-3">
            <FiCheckCircle size={18} className="text-emerald-400" />
            <p className="text-emerald-400 font-semibold">Training Complete</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Real samples used</span>
              <span className="text-white font-medium">{result.samples}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Model saved</span>
              <span className="text-emerald-400 font-medium">ml/model.pkl</span>
            </div>
          </div>
        </div>
      )}

      <VizSection viz={viz} loading={vizLoading} refetch={refetchViz} />

      <div className="card mt-4 flex items-start gap-3">
        <FiInfo size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs leading-relaxed">
          The model automatically bootstraps with 200 synthetic data points on first run. Retraining with more real student data improves prediction accuracy. Trigger this after adding a significant number of new students.
        </p>
      </div>
    </div>
  )
}