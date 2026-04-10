import { Pool, PoolClient } from 'pg';

/** Convert MySQL-style `?` placeholders to Postgres `$1`, `$2`, ... */
export function toPostgresParams(sql: string, params: unknown[] = []): { text: string; values: unknown[] } {
  let n = 0;
  const text = sql.replace(/\?/g, () => `$${++n}`);
  return { text, values: params };
}

function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!(globalThis as any).__pgPool) {
    (globalThis as any).__pgPool = new Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 60_000,
    });
  }
  return (globalThis as any).__pgPool as Pool;
}

export async function testConnection() {
  try {
    const pool = getPool();
    await pool.query('SELECT 1 AS test');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const pool = getPool();
  try {
    const { text, values } = toPostgresParams(query, params);
    console.log(`🔗 DB - Executing query: ${text.substring(0, 80)}...`);
    const result = await pool.query(text, values);
    return {
      success: true,
      data: result.rows as any[],
      rowCount: result.rowCount ?? 0,
    };
  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function executeTransaction(queries: { query: string; params?: any[] }[]) {
  const pool = getPool();
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const results: any[] = [];
    for (const { query, params = [] } of queries) {
      const { text, values } = toPostgresParams(query, params);
      const r = await client.query(text, values);
      results.push(r.rows);
    }
    await client.query('COMMIT');
    return { success: true, data: results };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  } finally {
    client.release();
  }
}

export function getPoolStatus() {
  return {
    config: { driver: 'pg', max: 10 },
  };
}

const poolExport = {
  query: async (text: string, params?: any[]) => {
    const pool = getPool();
    const { text: t, values } = toPostgresParams(text, params || []);
    return pool.query(t, values);
  },
};

export default poolExport as unknown as Pool;
