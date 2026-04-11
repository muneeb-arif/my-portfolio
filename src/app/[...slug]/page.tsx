import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PortfolioHomeClient } from '@/components/PortfolioHomeClient';
import { buildHomeMetadata } from '@/lib/siteMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return buildHomeMetadata(h);
}

/** Non-root paths render the same SPA-style portfolio as `/` (CRA catch-all `*`). */
export default function SlugPortfolioPage() {
  return <PortfolioHomeClient />;
}
