import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

const BUCKET_PREFIX: Record<string, string> = {
  images: 'images',
  avatars: 'avatars',
  documents: 'documents',
  domains: 'domains',
  updates: 'updates',
};

function blobPutAccess(): 'public' | 'private' {
  return String(process.env.BLOB_PUT_ACCESS || 'public').toLowerCase() === 'private' ? 'private' : 'public';
}

function sanitizeFilename(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot !== -1 ? name.slice(0, lastDot) : name;
  const ext = lastDot !== -1 ? name.slice(lastDot) : '';
  const safe = base
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
  return safe + ext;
}

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const bucket = (form.get('bucket') as string) || 'images';
    const prefix = BUCKET_PREFIX[bucket] || 'images';

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 });
    }

    const userId = request.user!.id;
    const ts = Date.now();
    const safeName = sanitizeFilename(file.name);
    const pathname = `${prefix}/${userId}/${ts}_${safeName}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const blob = await put(pathname, buf, {
      access: blobPutAccess(),
      token,
      contentType: file.type || undefined,
    });

    const relativePath = `${userId}/${ts}_${safeName}`;

    return NextResponse.json({
      success: true,
      data: {
        path: relativePath,
        url: blob.url,
        pathname: blob.pathname,
        name: safeName,
        original_name: file.name,
        size: file.size,
        type: file.type,
        bucket,
      },
    });
  } catch (error) {
    console.error('storage/upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
});
