import { NextResponse } from 'next/server';
import { del, list } from '@vercel/blob';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

const BUCKET_PREFIX: Record<string, string> = {
  images: 'images',
  avatars: 'avatars',
  documents: 'documents',
  domains: 'domains',
  updates: 'updates',
};

export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const relPath = searchParams.get('path');
    const bucket = searchParams.get('bucket') || 'images';
    const prefix = BUCKET_PREFIX[bucket] || 'images';
    const userId = request.user!.id;

    let targetUrl = url;
    if (!targetUrl && relPath) {
      if (!relPath.startsWith(`${userId}/`)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      const pathname = `${prefix}/${relPath}`;
      const { blobs } = await list({ prefix: pathname, token, limit: 10 });
      const hit = blobs.find((b) => b.pathname === pathname);
      if (!hit) {
        return NextResponse.json({ success: false, error: 'Object not found' }, { status: 404 });
      }
      targetUrl = hit.url;
    }

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Provide url or path query param' },
        { status: 400 }
      );
    }

    if (!targetUrl.includes(`/${userId}/`)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await del(targetUrl, { token });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('storage/delete error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
});
