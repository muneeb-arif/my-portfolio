import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// POST /api/automatic-update-logs - Log automatic update activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { update_id, client_id, activity, details, user_agent, domain } = body;

    // Validate required fields
    if (!update_id || !client_id || !activity) {
      return NextResponse.json(
        { error: 'Missing required fields: update_id, client_id, activity' },
        { status: 400 }
      );
    }

    // Generate UUID for the log entry
    const logId = crypto.randomUUID();
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert the log entry
    const insertQuery = `
      INSERT INTO automatic_update_logs (id, update_id, client_id, activity, details, user_agent, domain, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      logId,
      update_id,
      client_id,
      activity,
      details ? JSON.stringify(details) : null,
      user_agent || null,
      domain || null,
      timestamp
    ]);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to log activity', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully'
    });

  } catch (error) {
    console.error('❌ POST /api/automatic-update-logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/automatic-update-logs - Get automatic update logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const limit = searchParams.get('limit') || '10';

    let query = 'SELECT * FROM automatic_update_logs';
    const params: any[] = [];

    // Add filters
    if (clientId) {
      query += ' WHERE client_id = ?';
      params.push(clientId);
    }

    // Add ordering and limit
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const result = await executeQuery(query, params);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch logs', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ GET /api/automatic-update-logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 