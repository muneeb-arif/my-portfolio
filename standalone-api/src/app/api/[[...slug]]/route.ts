import { NextRequest, NextResponse } from 'next/server';
import { dispatchApi } from '@/lib/api-router.generated';

type RouteCtx = { params: { slug?: string[] } };

function segments(ctx: RouteCtx): string[] {
  const s = ctx.params.slug;
  if (Array.isArray(s)) return s;
  if (typeof s === 'string') return [s];
  return [];
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  return dispatchApi('GET', req, segments(ctx));
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  return dispatchApi('POST', req, segments(ctx));
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  return dispatchApi('PUT', req, segments(ctx));
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return dispatchApi('PATCH', req, segments(ctx));
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  return dispatchApi('DELETE', req, segments(ctx));
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
