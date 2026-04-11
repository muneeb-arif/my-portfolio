import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { executeQuery } from '@/lib/database';

const IMAGES_PREFIX = 'images';

async function getUserByDomain(domain: string) {
  const query = `
    SELECT u.id, d.status, d.name
    FROM users u
    INNER JOIN domains d ON u.id = d.user_id
    WHERE d.name LIKE ?
    AND d.status = 1
    LIMIT 1
  `;

  const pattern = `%${domain}%`;
  const result = await executeQuery(query, [pattern]);

  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    const domainData = result.data[0] as { id: string; status: number };
    if (domainData.status === 1) {
      return domainData.id;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload?.id) {
          userId = payload.id;
        }
      } catch {
        /* public mode */
      }
    }

    if (!userId) {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      if (origin) {
        const domain = origin.replace(/^https?:\/\//, '').split('/')[0];
        const domainVariants = [
          domain,
          `http://${domain}`,
          `https://${domain}`,
          domain.replace(':3000', ''),
          `http://${domain.replace(':3000', '')}`,
        ];
        for (const variant of domainVariants) {
          userId = await getUserByDomain(variant);
          if (userId) break;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ success: true, data: [], demo: false });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error('gallery: BLOB_READ_WRITE_TOKEN missing');
      return NextResponse.json({ success: true, data: [], demo: false });
    }

    const prefix = `${IMAGES_PREFIX}/${userId}/`;
    const { blobs } = await list({ prefix, token: blobToken });

    const imageFiles = (blobs || [])
      .filter((b) => /\.(jpg|jpeg|png|gif|webp)$/i.test(b.pathname) && !b.pathname.split('/').pop()!.startsWith('.'))
      .map((b) => {
        const parts = b.pathname.split('/');
        const fileName = parts[parts.length - 1];
        const fullPath = `${userId}/${fileName}`;
        return {
          name: fileName,
          fullPath,
          url: b.url,
          pathname: b.pathname,
          id: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
        };
      });

    return NextResponse.json({
      success: true,
      data: imageFiles,
      demo: false,
    });
  } catch (error) {
    console.error('Get gallery images error:', error);
    return NextResponse.json({ success: true, data: [], demo: false });
  }
}
