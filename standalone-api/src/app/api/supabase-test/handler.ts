import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { list } from '@vercel/blob';

/** Legacy path name; tests Postgres + Vercel Blob instead of Supabase. */
export async function GET() {
  try {
    const db = await executeQuery('SELECT 1 AS ok', []);
    if (!db.success) {
      return NextResponse.json(
        { success: false, error: 'Postgres check failed', details: db.error },
        { status: 500 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    let blobOk = false;
    let blobCount = 0;
    if (token) {
      const r = await list({ limit: 1, token });
      blobOk = true;
      blobCount = r.blobs?.length ?? 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Postgres + Blob connectivity',
      details: {
        postgres: 'ok',
        blob: token ? (blobOk ? 'ok' : 'error') : 'skipped (no BLOB_READ_WRITE_TOKEN)',
        sampleBlobListCount: blobCount,
      },
    });
  } catch (error) {
    console.error('Connectivity test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
