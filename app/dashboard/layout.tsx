import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthWrapper } from '@/components/auth/AuthWrapper'
import { DashboardProvider } from '@/components/dashboard/DashboardProvider'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Portfolio management dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthWrapper>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </DashboardProvider>
    </AuthWrapper>
  )
} 