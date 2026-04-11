import { executeQuery } from '@/lib/database';

/** Match domains row using the same LIKE pattern as the legacy settings API (full site URL in pattern). */
export async function getUserIdByDomainLookup(domainHint: string): Promise<string | null> {
  if (!domainHint?.trim()) return null;

  const query = `
    SELECT u.id, d.status, d.name
    FROM users u
    INNER JOIN domains d ON u.id = d.user_id
    WHERE d.name LIKE ?
    AND d.status = 1
    LIMIT 1
  `;

  const pattern = `%${domainHint.trim()}%`;
  const result = await executeQuery(query, [pattern]);

  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as { id: string; status: number };
    if (domainData.status === 1) {
      return domainData.id;
    }
  }
  return null;
}

/** Canonical site URL for domain resolution (e.g. https://www.example.com). */
export function resolveSiteUrlFromHeaders(headers: Headers): string | null {
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  if (!host) return null;
  const proto =
    headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function getDemoSettingsRecord(): Record<string, unknown> {
  return {
    banner_name: 'Muneeb Arif',
    banner_title: 'Full Stack Developer',
    banner_tagline: 'Building modern web applications with passion and precision',
    theme_name: 'sand',
    avatar_image: '/images/profile/avatar.jpeg',
    hero_image: '/images/hero-bg.png',
    section_hero_visible: true,
    section_portfolio_visible: true,
    section_technologies_visible: true,
    section_domains_visible: true,
    section_project_cycle_visible: true,
    section_prompts_visible: false,
    section_gallery_visible: true,
    show_resume_download: true,
    show_view_work_button: true,
    custom_button_title: '',
    custom_button_link: '',
    custom_button_target: '_self',
    logo_type: 'initials',
    site_url: 'https://my-portfolio-apis.vercel.app',
  };
}

export async function loadSettingsObjectForUserId(userId: string): Promise<Record<string, unknown>> {
  const query = `SELECT * FROM settings WHERE user_id = ?`;
  const result = await executeQuery(query, [userId]);
  if (!result.success || !result.data) {
    return {};
  }
  const settingsObj: Record<string, unknown> = {};
  (result.data as { setting_key: string; setting_value: string }[]).forEach((setting) => {
    try {
      settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
    } catch {
      settingsObj[setting.setting_key] = setting.setting_value;
    }
  });
  return settingsObj;
}

/** Resolve portfolio owner user id from request (Host / Origin variants), matching /api/projects domain logic. */
export async function resolveTenantUserIdFromHeaders(headers: Headers): Promise<string | null> {
  const siteUrl = resolveSiteUrlFromHeaders(headers);
  if (siteUrl) {
    const u = await getUserIdByDomainLookup(siteUrl);
    if (u) return u;
  }
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  if (host) {
    const base = host.split(':')[0];
    const variants = [host, `http://${host}`, `https://${host}`, base, `http://${base}`, `https://${base}`];
    for (const v of variants) {
      const u = await getUserIdByDomainLookup(v);
      if (u) return u;
    }
  }
  const origin = headers.get('origin') || headers.get('referer');
  if (origin) {
    const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
    const variants = [
      domain,
      `http://${domain}`,
      `https://${domain}`,
      domain.replace(':3000', ''),
      `http://${domain.replace(':3000', '')}`,
      `https://${domain.replace(':3000', '')}`,
    ];
    for (const v of variants) {
      const u = await getUserIdByDomainLookup(v);
      if (u) return u;
    }
  }
  return null;
}

export type PublicSettingsPayload = { data: Record<string, unknown>; demo: boolean };

/**
 * Resolve public settings for a request (no auth): same rules as GET /api/settings when unauthenticated.
 */
export async function getPublicSettingsForHeaders(headers: Headers): Promise<PublicSettingsPayload> {
  const siteUrl = resolveSiteUrlFromHeaders(headers);
  if (!siteUrl) {
    return { data: getDemoSettingsRecord(), demo: true };
  }

  const userId = await getUserIdByDomainLookup(siteUrl);
  if (!userId) {
    return { data: getDemoSettingsRecord(), demo: true };
  }

  const data = await loadSettingsObjectForUserId(userId);
  return { data, demo: false };
}
