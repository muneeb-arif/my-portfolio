/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AUTO-GENERATED — do not edit. Run: node scripts/generate-api-router.mjs
 */
import { NextRequest, NextResponse } from 'next/server';

import * as m0 from '@/app/api/admin/sections/[sectionKey]/access/handler';
import * as m1 from '@/app/api/projects/[id]/images/handler';
import * as m2 from '@/app/api/admin/check-images/handler';
import * as m3 from '@/app/api/admin/fix-image-order/handler';
import * as m4 from '@/app/api/admin/sections/handler';
import * as m5 from '@/app/api/auth/login/handler';
import * as m6 from '@/app/api/auth/me/handler';
import * as m7 from '@/app/api/auth/register/handler';
import * as m8 from '@/app/api/auth/reset-password/handler';
import * as m9 from '@/app/api/auth/test-token/handler';
import * as m10 from '@/app/api/auth/update-password/handler';
import * as m11 from '@/app/api/automatic-update/dashboard/handler';
import * as m12 from '@/app/api/dashboard/projects/handler';
import * as m13 from '@/app/api/domains/config/handler';
import * as m14 from '@/app/api/domains/user/handler';
import * as m15 from '@/app/api/dynamic-sections/positioning/handler';
import * as m16 from '@/app/api/dynamic-sections/reorder/handler';
import * as m17 from '@/app/api/menus/reorder/handler';
import * as m18 from '@/app/api/menus/sections/handler';
import * as m19 from '@/app/api/storage/delete/handler';
import * as m20 from '@/app/api/storage/list/handler';
import * as m21 from '@/app/api/storage/upload/handler';
import * as m22 from '@/app/api/theme/application-logs/handler';
import * as m23 from '@/app/api/theme/stats/handler';
import * as m24 from '@/app/api/categories/[id]/handler';
import * as m25 from '@/app/api/contact-queries/[id]/handler';
import * as m26 from '@/app/api/menus/[id]/handler';
import * as m27 from '@/app/api/niches/[id]/handler';
import * as m28 from '@/app/api/projects/[id]/handler';
import * as m29 from '@/app/api/skills/[id]/handler';
import * as m30 from '@/app/api/technologies/[id]/handler';
import * as m31 from '@/app/api/automatic-update-logs/handler';
import * as m32 from '@/app/api/backup-files/handler';
import * as m33 from '@/app/api/categories/handler';
import * as m34 from '@/app/api/contact-queries/handler';
import * as m35 from '@/app/api/debug-domain/handler';
import * as m36 from '@/app/api/dynamic-sections/handler';
import * as m37 from '@/app/api/gallery/handler';
import * as m38 from '@/app/api/health/handler';
import * as m39 from '@/app/api/menus/handler';
import * as m40 from '@/app/api/niches/handler';
import * as m41 from '@/app/api/portfolio-config/handler';
import * as m42 from '@/app/api/projects/handler';
import * as m43 from '@/app/api/settings/handler';
import * as m44 from '@/app/api/shared-hosting-clients/handler';
import * as m45 from '@/app/api/shared-hosting-updates/handler';
import * as m46 from '@/app/api/skills/handler';
import * as m47 from '@/app/api/supabase-test/handler';
import * as m48 from '@/app/api/technologies/handler';
import * as m49 from '@/app/api/theme-clients/handler';
import * as m50 from '@/app/api/theme-update-logs/handler';
import * as m51 from '@/app/api/theme-updates/handler';

type Mod = Record<string, (req: NextRequest, ctx?: { params: Record<string, string> }) => Promise<Response | NextResponse> | Response | NextResponse>;

const ROUTES: Array<{ match: (s: string[]) => Record<string, string> | null; mod: Mod }> = [
  { match: (s: string[]) => (s.length === 4 && s[0] === "admin" && s[1] === "sections" && s[3] === "access") ? { "sectionKey": s[2] } : null, mod: m0 as unknown as Mod },
  { match: (s: string[]) => (s.length === 3 && s[0] === "projects" && s[2] === "images") ? { "id": s[1] } : null, mod: m1 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "admin" && s[1] === "check-images") ? {} : null, mod: m2 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "admin" && s[1] === "fix-image-order") ? {} : null, mod: m3 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "admin" && s[1] === "sections") ? {} : null, mod: m4 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "auth" && s[1] === "login") ? {} : null, mod: m5 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "auth" && s[1] === "me") ? {} : null, mod: m6 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "auth" && s[1] === "register") ? {} : null, mod: m7 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "auth" && s[1] === "reset-password") ? {} : null, mod: m8 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "auth" && s[1] === "test-token") ? {} : null, mod: m9 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "auth" && s[1] === "update-password") ? {} : null, mod: m10 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "automatic-update" && s[1] === "dashboard") ? {} : null, mod: m11 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "dashboard" && s[1] === "projects") ? {} : null, mod: m12 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "domains" && s[1] === "config") ? {} : null, mod: m13 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "domains" && s[1] === "user") ? {} : null, mod: m14 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "dynamic-sections" && s[1] === "positioning") ? {} : null, mod: m15 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "dynamic-sections" && s[1] === "reorder") ? {} : null, mod: m16 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "menus" && s[1] === "reorder") ? {} : null, mod: m17 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "menus" && s[1] === "sections") ? {} : null, mod: m18 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "storage" && s[1] === "delete") ? {} : null, mod: m19 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "storage" && s[1] === "list") ? {} : null, mod: m20 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "storage" && s[1] === "upload") ? {} : null, mod: m21 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "theme" && s[1] === "application-logs") ? {} : null, mod: m22 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "theme" && s[1] === "stats") ? {} : null, mod: m23 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "categories") ? { "id": s[1] } : null, mod: m24 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "contact-queries") ? { "id": s[1] } : null, mod: m25 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "menus") ? { "id": s[1] } : null, mod: m26 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "niches") ? { "id": s[1] } : null, mod: m27 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "projects") ? { "id": s[1] } : null, mod: m28 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "skills") ? { "id": s[1] } : null, mod: m29 as unknown as Mod },
  { match: (s: string[]) => (s.length === 2 && s[0] === "technologies") ? { "id": s[1] } : null, mod: m30 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "automatic-update-logs") ? {} : null, mod: m31 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "backup-files") ? {} : null, mod: m32 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "categories") ? {} : null, mod: m33 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "contact-queries") ? {} : null, mod: m34 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "debug-domain") ? {} : null, mod: m35 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "dynamic-sections") ? {} : null, mod: m36 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "gallery") ? {} : null, mod: m37 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "health") ? {} : null, mod: m38 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "menus") ? {} : null, mod: m39 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "niches") ? {} : null, mod: m40 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "portfolio-config") ? {} : null, mod: m41 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "projects") ? {} : null, mod: m42 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "settings") ? {} : null, mod: m43 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "shared-hosting-clients") ? {} : null, mod: m44 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "shared-hosting-updates") ? {} : null, mod: m45 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "skills") ? {} : null, mod: m46 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "supabase-test") ? {} : null, mod: m47 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "technologies") ? {} : null, mod: m48 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "theme-clients") ? {} : null, mod: m49 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "theme-update-logs") ? {} : null, mod: m50 as unknown as Mod },
  { match: (s: string[]) => (s.length === 1 && s[0] === "theme-updates") ? {} : null, mod: m51 as unknown as Mod },
];

async function invoke(
  handler: ((req: NextRequest, ctx?: { params: Record<string, string> }) => Promise<Response | NextResponse> | Response | NextResponse) | undefined,
  req: NextRequest,
  params: Record<string, string>
): Promise<Response | NextResponse> {
  if (!handler) {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }
  const fn = handler as (req: NextRequest, ctx?: { params: Record<string, string> }) => Promise<Response | NextResponse>;
  if (fn.length >= 2) {
    return fn(req, { params: params as Record<string, string> });
  }
  return fn(req);
}

export async function dispatchApi(method: string, req: NextRequest, slug: string[]): Promise<Response | NextResponse> {
  for (const r of ROUTES) {
    const params = r.match(slug);
    if (!params) continue;
    const h = r.mod[method];
    return invoke(h, req, params);
  }
  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}
