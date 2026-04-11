import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { executeQuery } from '@/lib/database';
import { resolveSiteUrlFromHeaders, resolveTenantUserIdFromHeaders } from '@/lib/publicSiteSettings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const base =
    resolveSiteUrlFromHeaders(h) ??
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || null) ??
    'http://localhost:3000';
  const baseUrl = base.replace(/\/$/, '');

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const userId = await resolveTenantUserIdFromHeaders(h);
  if (!userId) {
    return entries;
  }

  const result = await executeQuery(
    `SELECT id, updated_at FROM projects WHERE user_id = ? AND status = 'published' ORDER BY updated_at DESC`,
    [userId]
  );

  if (!result.success || !Array.isArray(result.data)) {
    return entries;
  }

  for (const row of result.data as { id: string; updated_at?: string | Date | null }[]) {
    if (!row?.id) continue;
    const lastModified = row.updated_at ? new Date(row.updated_at) : new Date();
    entries.push({
      url: `${baseUrl}/project/${row.id}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  return entries;
}
