import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { executeQuery } from '@/lib/database';

function requireAdmin(user: { is_admin?: number } | undefined) {
  return !!user && Number(user.is_admin) === 1;
}

/**
 * Admin dashboard payload (replaces Supabase automatic_update RPC + direct table reads).
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  if (!requireAdmin(request.user)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const daysBack = Math.min(
    365,
    Math.max(1, parseInt(new URL(request.url).searchParams.get('days') || '30', 10) || 30)
  );

  try {
    const [capRes, actRes, updatesRes, clientsRes] = await Promise.all([
      executeQuery(
        `SELECT * FROM automatic_update_capabilities WHERE is_active = TRUE ORDER BY updated_at DESC`,
        []
      ),
      executeQuery(
        `SELECT * FROM recent_automatic_activity
         WHERE "timestamp" > NOW() - (?::int * INTERVAL '1 day')
         ORDER BY "timestamp" DESC
         LIMIT 50`,
        [daysBack]
      ),
      executeQuery(
        `SELECT * FROM shared_hosting_updates ORDER BY created_at DESC`,
        []
      ),
      executeQuery(
        `SELECT * FROM shared_hosting_clients ORDER BY last_seen DESC`,
        []
      ),
    ]);

    if (!capRes.success || !actRes.success || !updatesRes.success || !clientsRes.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            capRes.error ||
            actRes.error ||
            updatesRes.error ||
            clientsRes.error ||
            'Query failed',
        },
        { status: 500 }
      );
    }

    const capabilities = capRes.data || [];
    const recentActivity = actRes.data || [];
    const updatesRaw = (updatesRes.data || []) as Record<string, unknown>[];
    const clients = clientsRes.data || [];

    const statsRes = await executeQuery(
      `SELECT
         COUNT(*)::int AS clients_with_capability,
         COUNT(*) FILTER (WHERE supports_automatic = TRUE)::int AS clients_supporting_auto
       FROM automatic_update_capabilities
       WHERE is_active = TRUE`,
      []
    );

    const perfRes = await executeQuery(
      `SELECT
         COALESCE(SUM(total_attempts), 0)::int AS total_attempts,
         COALESCE(SUM(successful_updates), 0)::int AS successful_attempts,
         COALESCE(AVG(avg_execution_time_ms), 0)::int AS avg_execution_time_ms
       FROM automatic_update_client_performance`,
      []
    );

    const statsRow = (statsRes.data as any[])?.[0] || {};
    const perfRow = (perfRes.data as any[])?.[0] || {};

    const clientsWithCapability = Number(statsRow.clients_with_capability) || 0;
    const clientsSupportingAuto = Number(statsRow.clients_supporting_auto) || 0;
    const totalAttempts = Number(perfRow.total_attempts) || 0;
    const successfulAttempts = Number(perfRow.successful_attempts) || 0;
    const avgExecution = Number(perfRow.avg_execution_time_ms) || 0;

    const activityTotal = recentActivity.length;
    const activityOk = (recentActivity as { success?: boolean }[]).filter((r) => r.success).length;

    const successRate =
      activityTotal > 0 ? Math.round((activityOk / activityTotal) * 10000) / 100 : 0;
    const rpcStyleSuccess =
      totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 10000) / 100 : successRate;

    const autoSupportRate =
      clientsWithCapability > 0
        ? Math.round((clientsSupportingAuto / clientsWithCapability) * 10000) / 100
        : 0;

    const automaticStats = {
      clients_with_capability: clientsWithCapability,
      clients_supporting_auto: clientsSupportingAuto,
      success_rate: rpcStyleSuccess,
      avg_execution_time_ms: avgExecution || (activityTotal > 0 ? 3000 : 0),
      auto_support_rate: autoSupportRate,
      total_attempts: totalAttempts,
      successful_attempts: successfulAttempts,
      period_days: daysBack,
    };

    const updates = updatesRaw.map((update: any) => {
      const fromFiles =
        update.files && Array.isArray(update.files) && update.files[0]?.url
          ? update.files[0].url
          : null;
      return {
        ...update,
        package_url: update.package_url || fromFiles,
      };
    });

    return NextResponse.json({
      success: true,
      capabilities,
      recentActivity,
      updates,
      clients,
      automaticStats,
    });
  } catch (e) {
    console.error('automatic-update/dashboard', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
