'use client'

export function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <div className={`${s} border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin ${className}`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export function Empty({ message = 'No data found', icon = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      {icon && <div className="text-slate-600 text-4xl">{icon}</div>}
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}

export function Badge({ type = 'info', children }) {
  const cls = {
    success: 'badge-success',
    warning: 'badge-pending',
    danger: 'badge-failed',
    info: 'badge-info',
    A: 'badge-success',
    B: 'badge-info',
    C: 'badge-pending',
    D: 'badge-pending',
    F: 'badge-failed',
    low: 'badge-success',
    medium: 'badge-pending',
    high: 'badge-failed',
  }
  return <span className={cls[type] || 'badge-info'}>{children}</span>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative card w-full max-w-md z-10 shadow-2xl" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function StatCard({ label, value, sub, accent = 'blue', icon }) {
  const accents = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  }
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${accents[accent] || accents.blue}`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {icon && <div className={`text-xl ${accents[accent] || accents.blue} opacity-60`}>{icon}</div>}
      </div>
    </div>
  )
}
