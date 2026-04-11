import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PortfolioHomeClient } from '@/components/PortfolioHomeClient';
import { buildHomeMetadata } from '@/lib/siteMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return buildHomeMetadata(h);
}

/** `/` and all non-API paths except more specific app routes (e.g. `/project/[id]`). */
export default function PortfolioCatchAllPage() {
  return <PortfolioHomeClient />;
}
