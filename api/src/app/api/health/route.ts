import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/health - Health check endpoint
export const GET = async (request: NextRequest) => {
  try {
    // Test database connection
    const dbResult = await executeQuery('SELECT 1 as test');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbResult.success ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    const status = dbResult.success ? 200 : 503;

    return NextResponse.json(health, { status });
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