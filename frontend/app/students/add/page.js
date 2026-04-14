'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiUser, FiHash, FiBook, FiPercent, FiClipboard } from 'react-icons/fi'
import useStudentStore from '@/stores/studentStore'
import usePredictionStore from '@/stores/predictionStore'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/layout/PageHeader'
import { Spinner } from '@/components/ui'
function AddStudentContent() {
  const [form, setForm] = useState({ name: '', rollNo: '', subject: '', attendance: '', im1: '', im2: '', im3: '', assignmentScore: '' })
  const [loading, setLoading] = useState(false)
  const { addStudent } = useStudentStore()
  const { predict } = usePredictionStore()
  const router = useRouter()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    const { name, rollNo, subject, attendance, im1, im2, im3, assignmentScore } = form
    if (!name || !rollNo || !subject || !attendance || !im1 || !im2 || !im3 || !assignmentScore) return toast.error('All fields are required')
    const att = parseFloat(attendance)
    const asgn = parseFloat(assignmentScore)
    const marks = [parseFloat(im1), parseFloat(im2), parseFloat(im3)]
    if (att < 0 || att > 100 || asgn < 0 || asgn > 100) return toast.error('Scores must be between 0 and 100')
    if (marks.some(m => m < 0 || m > 100)) return toast.error('Internal marks must be between 0 and 100')
    setLoading(true)
    try {
      const student = await addStudent({ name: name.trim(), rollNo: rollNo.trim(), subject: subject.trim(), attendance: att, internalMarks: marks, assignmentScore: asgn })
      toast.success('Student added!')
      try {
        await predict(student.id)
        toast.success('Prediction generated!')
      } catch {}
      router.push('/students')
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="page-container">
      <PageHeader title="Add Student" back />
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" placeholder="Arjun Sharma" value={form.name} onChange={set('name')} />
            </div>
          </div>
          <div>
            <label className="label">Roll Number</label>
            <div className="relative">
              <FiHash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" placeholder="CS001" value={form.rollNo} onChange={set('rollNo')} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Subject</label>
          <div className="relative">
            <FiBook size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9" placeholder="Mathematics" value={form.subject} onChange={set('subject')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Attendance (%)</label>
            <div className="relative">
              <FiPercent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" type="number" min="0" max="100" placeholder="85" value={form.attendance} onChange={set('attendance')} />
            </div>
          </div>
          <div>
            <label className="label">Assignment Score</label>
            <div className="relative">
              <FiClipboard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" type="number" min="0" max="100" placeholder="78" value={form.assignmentScore} onChange={set('assignmentScore')} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Internal Marks (3 tests, out of 100 each)</label>
          <div className="grid grid-cols-3 gap-2">
            {['im1', 'im2', 'im3'].map((k, i) => (
              <input key={k} className="input text-center" type="number" min="0" max="100" placeholder={`Test ${i + 1}`} value={form[k]} onChange={set(k)} />
            ))}
          </div>
        </div>
        <button className="btn-primary w-full" onClick={submit} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Add Student & Predict'}
        </button>
      </div>
    </div>
  )
}
export default function AddStudentPage() {
  return <AppLayout><AddStudentContent /></AppLayout>
}
