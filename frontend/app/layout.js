import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import BottomNav from '@/components/layout/BottomNav'
const inter = Inter({ subsets: ['latin'] })
export const metadata = { title: 'Student Performance Predictor', description: 'ML-based student academic performance prediction system' }
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <BottomNav />
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      </body>
    </html>
  )
}
