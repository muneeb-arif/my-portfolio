import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import crypto from 'crypto';

/** Public: log theme apply success/failure from browser. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { update_id, client_id, status, error_message, domain, version } = body;

    if (!client_id || !status) {
      return NextResponse.json({ error: 'client_id and status are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const t = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const result = await executeQuery(
      `INSERT INTO theme_update_logs (id, update_id, client_id, domain, version, status, log_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        update_id || null,
        client_id,
        domain || null,
        version || null,
        status,
        error_message || null,
        t,
      ]
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('theme/application-logs POST', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
