import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

function requireAdmin(user: { is_admin?: number } | undefined) {
  return !!user && Number(user.is_admin) === 1;
}

/** Admin: recent theme update application logs */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  if (!requireAdmin(request.user)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const limit = Math.min(
    500,
    Math.max(1, parseInt(new URL(request.url).searchParams.get('limit') || '100', 10) || 100)
  );

  const result = await executeQuery(
    `SELECT * FROM theme_update_logs ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data || [] });
});
