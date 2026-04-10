import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

/** Public read: single active portfolio_config row by owner email (CRA env). */
export async function GET(request: NextRequest) {
  try {
    const email = new URL(request.url).searchParams.get('owner_email');
    if (!email) {
      return NextResponse.json({ success: false, error: 'owner_email is required' }, { status: 400 });
    }

    const result = await executeQuery(
      `SELECT * FROM portfolio_config WHERE owner_email = ? AND is_active = TRUE LIMIT 1`,
      [email]
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    const rows = result.data as Record<string, unknown>[];
    if (!rows?.length) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (e) {
    console.error('portfolio-config GET', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
