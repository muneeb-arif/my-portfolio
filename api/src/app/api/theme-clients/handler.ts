import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import crypto from 'crypto';

function nowSql() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function requireAdmin(user: { is_admin?: number } | undefined) {
  return !!user && Number(user.is_admin) === 1;
}

/** Admin: list registered theme clients */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  if (!requireAdmin(request.user)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const result = await executeQuery(
    `SELECT * FROM theme_clients ORDER BY last_seen DESC`,
    []
  );
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: result.data || [] });
});

/** Public: theme updater registers browser clients (no auth). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      client_id,
      domain,
      current_version,
      update_channel = 'stable',
      user_agent,
      timezone,
    } = body;

    if (!client_id || !domain) {
      return NextResponse.json({ error: 'client_id and domain are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const t = nowSql();

    const upsert = `
      INSERT INTO theme_clients (id, client_id, domain, current_version, update_channel, last_seen, user_agent, timezone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (client_id) DO UPDATE SET
        domain = EXCLUDED.domain,
        current_version = EXCLUDED.current_version,
        update_channel = EXCLUDED.update_channel,
        last_seen = EXCLUDED.last_seen,
        user_agent = EXCLUDED.user_agent,
        timezone = EXCLUDED.timezone,
        updated_at = EXCLUDED.updated_at
    `;

    const result = await executeQuery(upsert, [
      id,
      client_id,
      domain,
      current_version || '1.0.0',
      update_channel,
      t,
      user_agent || null,
      timezone || 'UTC',
      t,
      t,
    ]);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('theme-clients POST', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, current_version } = body;
    if (!client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    const t = nowSql();
    const result = await executeQuery(
      `UPDATE theme_clients SET current_version = COALESCE(?, current_version), last_updated = ?, updated_at = ? WHERE client_id = ?`,
      [current_version || null, t, t, client_id]
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('theme-clients PATCH', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
