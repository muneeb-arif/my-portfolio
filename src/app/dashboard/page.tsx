import type { Metadata } from 'next';
import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="dashboard-loading">
          <p>Loading dashboard...</p>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
