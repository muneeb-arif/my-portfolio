import { executeQuery } from '@/lib/database';
import type { Metadata } from 'next';
import { resolveSiteUrlFromHeaders, resolveTenantUserIdFromHeaders } from '@/lib/publicSiteSettings';

export type PublicProjectView = Record<string, unknown> & {
  project_images?: unknown[];
};

export async function getPublishedProjectForRequest(
  projectId: string,
  headers: Headers
): Promise<PublicProjectView | null> {
  const userId = await resolveTenantUserIdFromHeaders(headers);
  if (!userId) return null;

  const pq = await executeQuery(
    `SELECT * FROM projects WHERE id = ? AND user_id = ? AND status = 'published'`,
    [projectId, userId]
  );
  if (!pq.success || !pq.data || !Array.isArray(pq.data) || pq.data.length === 0) {
    return null;
  }
  const project = pq.data[0] as Record<string, unknown>;
  const iq = await executeQuery(
    `SELECT * FROM project_images WHERE project_id = ? ORDER BY order_index ASC`,
    [projectId]
  );
  const images = iq.success && Array.isArray(iq.data) ? iq.data : [];
  return { ...project, project_images: images };
}

function absUrl(siteUrl: string, url: unknown): string | undefined {
  if (url == null) return undefined;
  const s = String(url).trim();
  if (!s) return undefined;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${siteUrl}${path}`;
}

export function buildProjectMetadata(project: PublicProjectView, siteUrl: string): Metadata {
  const title = String(project.title ?? 'Project');
  const desc = String(project.description ?? project.overview ?? title);
  const images = (project.project_images as { url?: string }[] | undefined) ?? [];
  const first = images[0]?.url;
  const ogImage = absUrl(siteUrl, first) ?? absUrl(siteUrl, '/images/hero-bg.png');

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: desc,
    openGraph: {
      type: 'article',
      url: `${siteUrl}/project/${project.id}`,
      title,
      description: desc,
      images: ogImage ? [{ url: ogImage, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export async function buildProjectPageMetadata(
  projectId: string,
  headers: Headers
): Promise<Metadata> {
  const siteUrl = resolveSiteUrlFromHeaders(headers) ?? 'http://localhost:3000';
  const project = await getPublishedProjectForRequest(projectId, headers);
  if (!project) {
    return { title: 'Project', robots: { index: true, follow: true } };
  }
  return buildProjectMetadata(project, siteUrl);
}
