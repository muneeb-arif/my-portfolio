import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { resolveSiteUrlFromHeaders } from '@/lib/publicSiteSettings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const base =
    resolveSiteUrlFromHeaders(h)?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'http://localhost:3000';

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
