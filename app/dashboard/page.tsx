import { Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardLayout />
    </Suspense>
  )
} 