'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiCpu, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { adminAPI } from '@/services/api'
import { Spinner } from '@/components/ui'

export default function AdminTrainPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const train = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await adminAPI.trainModel()
      setResult(res.data.data)
      toast.success('Model retrained successfully!')
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

      <div className="card mt-4 flex items-start gap-3">
        <FiInfo size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs leading-relaxed">
          The model automatically bootstraps with 200 synthetic data points on first run. Retraining with more real student data improves prediction accuracy. Trigger this after adding a significant number of new students.
        </p>
      </div>
    </div>
  )
}
