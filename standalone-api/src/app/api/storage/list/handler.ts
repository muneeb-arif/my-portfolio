import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

const BUCKET_PREFIX: Record<string, string> = {
  images: 'images',
  avatars: 'avatars',
  documents: 'documents',
  domains: 'domains',
  updates: 'updates',
};

/** List blobs under `{bucket}/{userId}/` (same layout as uploads). */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket') || 'images';
    const prefixRoot = BUCKET_PREFIX[bucket] || 'images';
    const userId = request.user!.id;
    const prefix = `${prefixRoot}/${userId}/`;

    const { blobs } = await list({ prefix, token, limit: 1000 });

    const data = (blobs || []).map((b) => {
      const parts = b.pathname.split('/');
      const fileName = parts[parts.length - 1] || b.pathname;
      return {
        name: fileName,
        pathname: b.pathname,
        url: b.url,
        size: b.size,
        uploadedAt: b.uploadedAt,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('storage/list error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'List failed' },
      { status: 500 }
    );
  }
});
