import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PortfolioHomeClient } from '@/components/PortfolioHomeClient';
import { buildHomeMetadata } from '@/lib/siteMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return buildHomeMetadata(h);
}

export default function HomePage() {
  return <PortfolioHomeClient />;
}
