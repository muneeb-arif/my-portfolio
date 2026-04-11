import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || request.headers.get('referer');
    const domain = origin ? origin.replace(/^https?:\/\//, '').split('/')[0] : null;
    
    console.log('🔍 Debug Domain Lookup:');
    console.log('  Origin:', origin);
    console.log('  Extracted domain:', domain);
    
    // Test database connection
    const connectionTest = await executeQuery('SELECT 1 as test');
    console.log('  Database connection test:', connectionTest);
    
    // Test domain lookup
    let domainResult = null;
    if (domain) {
      const query = `
        SELECT u.id, u.email, d.name, d.status 
        FROM users u 
        INNER JOIN domains d ON u.id = d.user_id 
        WHERE d.name = ?
      `;
      domainResult = await executeQuery(query, [domain]);
      console.log('  Domain lookup result:', domainResult);
    }
    
    // Test all domains
    const allDomains = await executeQuery('SELECT u.id, u.email, d.name, d.status FROM users u INNER JOIN domains d ON u.id = d.user_id');
    console.log('  All domains in database:', allDomains);
    
    return NextResponse.json({
      success: true,
      debug: {
        origin,
        extractedDomain: domain,
        databaseConnection: connectionTest.success,
        domainLookup: domainResult,
        allDomains: allDomains.success ? allDomains.data : null,
        env: {
          MYSQL_HOST: process.env.MYSQL_HOST,
          MYSQL_PORT: process.env.MYSQL_PORT,
          MYSQL_USER: process.env.MYSQL_USER,
          MYSQL_DATABASE: process.env.MYSQL_DATABASE,
          NODE_ENV: process.env.NODE_ENV
        }
      }
    });
  } catch (error) {
    console.error('Debug domain error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 