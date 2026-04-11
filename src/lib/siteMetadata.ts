import type { Metadata } from 'next';
import { getPublicSettingsForHeaders, resolveSiteUrlFromHeaders } from '@/lib/publicSiteSettings';

function absoluteImageUrl(siteUrl: string, raw: unknown): string | undefined {
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('%PUBLIC_URL%')) {
    return s.replace('%PUBLIC_URL%', siteUrl);
  }
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${siteUrl}${path}`;
}

/** Build Next Metadata from settings row (same fields as DynamicHead / metaTagService). */
export function metadataFromSettings(
  settings: Record<string, unknown>,
  siteUrl: string
): Metadata {
  const bannerName = String(settings.banner_name ?? '');
  const bannerTitle = String(settings.banner_title ?? '');
  const bannerTagline = String(settings.banner_tagline ?? '');
  const siteName = String(settings.site_name ?? 'Portfolio');
  const themeColor = String(settings.theme_color ?? '#E9CBA7');
  const avatarRaw = settings.whatsapp_preview_image ?? settings.avatar_image ?? '';

  const title =
    bannerName && bannerTitle ? `${bannerName} - ${bannerTitle}` : siteName;
  const description =
    bannerTagline || (bannerName && bannerTitle ? `${bannerName} - ${bannerTitle} Portfolio` : siteName);

  const image = absoluteImageUrl(siteUrl, avatarRaw) ?? `${siteUrl}/images/profile/avatar.jpeg`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    applicationName: siteName,
    themeColor,
    openGraph: {
      type: 'website',
      url: siteUrl,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export async function buildHomeMetadata(headers: Headers): Promise<Metadata> {
  const siteUrl = resolveSiteUrlFromHeaders(headers) ?? 'http://localhost:3000';
  const { data } = await getPublicSettingsForHeaders(headers);
  return metadataFromSettings(data, siteUrl);
}
