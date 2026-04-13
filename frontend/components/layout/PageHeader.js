'use client'
import { useRouter } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'

export default function PageHeader({ title, back, action }) {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300">
            <FiArrowLeft size={16} />
          </button>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
