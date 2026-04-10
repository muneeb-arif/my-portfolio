import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';
import crypto from 'crypto';

function nowIso() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function requireAdmin(user: { is_admin?: number } | undefined) {
  return !!user && Number(user.is_admin) === 1;
}

/** Admin: list shared hosting clients */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  if (!requireAdmin(request.user)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  let query = 'SELECT * FROM shared_hosting_clients ORDER BY last_seen DESC';
  const params: unknown[] = [];
  if (limit) {
    const n = parseInt(limit, 10);
    if (!isNaN(n) && n > 0) {
      query += ' LIMIT ?';
      params.push(n);
    }
  }

  const result = await executeQuery(query, params);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data || [] });
});

/** Public: register / heartbeat (cPanel clients) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      client_id,
      domain,
      current_version = '1.0.0',
      deployment_type = 'shared_hosting',
      hosting_provider,
      cpanel_info,
      user_agent,
      timezone = 'UTC',
      contact_email,
      notes,
      is_active = true,
    } = body;

    if (!client_id || !domain) {
      return NextResponse.json({ error: 'client_id and domain are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const t = nowIso();
    const cpanelJson = cpanel_info != null ? JSON.stringify(cpanel_info) : null;

    const upsert = `
      INSERT INTO shared_hosting_clients (
        id, client_id, domain, current_version, deployment_type, hosting_provider,
        cpanel_info, last_seen, user_agent, timezone, contact_email, notes,
        is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (client_id) DO UPDATE SET
        domain = EXCLUDED.domain,
        current_version = EXCLUDED.current_version,
        deployment_type = EXCLUDED.deployment_type,
        hosting_provider = EXCLUDED.hosting_provider,
        cpanel_info = EXCLUDED.cpanel_info,
        last_seen = EXCLUDED.last_seen,
        user_agent = EXCLUDED.user_agent,
        timezone = EXCLUDED.timezone,
        contact_email = EXCLUDED.contact_email,
        notes = EXCLUDED.notes,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at
    `;

    const result = await executeQuery(upsert, [
      id,
      client_id,
      domain,
      current_version,
      deployment_type,
      hosting_provider || null,
      cpanelJson,
      t,
      user_agent || null,
      timezone,
      contact_email || null,
      notes || null,
      Boolean(is_active),
      t,
      t,
    ]);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('shared-hosting-clients POST', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
