import type { Metadata } from 'next';
import { Suspense } from 'react';
import Signup from '@/components/Signup';

export const metadata: Metadata = {
  title: 'Sign up',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}
