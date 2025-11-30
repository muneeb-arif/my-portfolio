import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/health - Health check endpoint
export const GET = async (request: NextRequest) => {
  try {
    // Test database connection (non-blocking - API can still work without DB for some endpoints)
    let dbResult;
    try {
      dbResult = await executeQuery('SELECT 1 as test');
    } catch (dbError) {
      // Database error is not critical - API server is still running
      dbResult = { success: false };
    }
    
    const health = {
      status: 'healthy', // API server is healthy even if DB is disconnected
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbResult.success ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Always return 200 - API server is running, DB status is informational
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(health, { status: 503 });
  }
}; 