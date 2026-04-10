import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

/** Recent theme update log rows for a client (replaces Supabase theme_update_stats query). */
export async function GET(request: NextRequest) {
  try {
    const clientId = new URL(request.url).searchParams.get('client_id');
    if (!clientId) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    const result = await executeQuery(
      `SELECT * FROM theme_update_logs WHERE client_id = ? ORDER BY created_at DESC LIMIT 10`,
      [clientId]
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, stats: result.data || [] });
  } catch (e) {
    console.error('theme/stats GET', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
