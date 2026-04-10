/**
 * Generates src/lib/api-router.generated.ts — single dispatch table for all API handlers.
 * Run from api/: node scripts/generate-api-router.mjs
 * (Also run via npm prebuild so Vercel gets one Serverless Function for /api/* on Hobby.)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, '../src/app/api');
const outFile = path.join(__dirname, '../src/lib/api-router.generated.ts');

function findHandlerDirs(dir, base = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === '[[...slug]]') continue;
    const full = path.join(dir, name);
    if (name === 'handler.ts') {
      if (base) out.push(base);
      continue;
    }
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      const rel = base ? `${base}/${name}` : name;
      out.push(...findHandlerDirs(full, rel));
    }
  }
  return out;
}

function buildMatchExpression(relPath) {
  const parts = relPath.split('/');
  const checks = [`s.length === ${parts.length}`];
  const paramPairs = [];
  parts.forEach((part, i) => {
    const m = /^\[(\w+)\]$/.exec(part);
    if (m) {
      paramPairs.push(`"${m[1]}": s[${i}]`);
    } else {
      checks.push(`s[${i}] === ${JSON.stringify(part)}`);
    }
  });
  const obj = paramPairs.length ? `{ ${paramPairs.join(', ')} }` : `{}`;
  return `(s: string[]) => (${checks.join(' && ')}) ? ${obj} : null`;
}

function dynamicSegmentCount(relPath) {
  return relPath.split('/').filter((p) => /^\[[^\]]+\]$/.test(p)).length;
}

function main() {
  let dirs = findHandlerDirs(apiRoot);
  // Longer paths first; at equal depth, prefer more static segments (e.g. menus/sections before menus/[id])
  dirs.sort((a, b) => {
    const sa = a.split('/');
    const sb = b.split('/');
    if (sb.length !== sa.length) return sb.length - sa.length;
    return dynamicSegmentCount(a) - dynamicSegmentCount(b);
  });

  const imports = dirs.map((rel, i) => {
    const importPath = `@/app/api/${rel}/handler`;
    return `import * as m${i} from '${importPath}';`;
  });

  const entries = dirs.map((rel, i) => {
    const match = buildMatchExpression(rel);
    return `  { match: ${match}, mod: m${i} as unknown as Mod },`;
  });

  const content = `/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AUTO-GENERATED — do not edit. Run: node scripts/generate-api-router.mjs
 */
import { NextRequest, NextResponse } from 'next/server';

${imports.join('\n')}

type Mod = Record<string, (req: NextRequest, ctx?: { params: Record<string, string> }) => Promise<Response | NextResponse> | Response | NextResponse>;

const ROUTES: Array<{ match: (s: string[]) => Record<string, string> | null; mod: Mod }> = [
${entries.join('\n')}
];

async function invoke(
  handler: ((req: NextRequest, ctx?: { params: Record<string, string> }) => Promise<Response | NextResponse> | Response | NextResponse) | undefined,
  req: NextRequest,
  params: Record<string, string>
): Promise<Response | NextResponse> {
  if (!handler) {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }
  const fn = handler as (req: NextRequest, ctx?: { params: Record<string, string> }) => Promise<Response | NextResponse>;
  if (fn.length >= 2) {
    return fn(req, { params: params as Record<string, string> });
  }
  return fn(req);
}

export async function dispatchApi(method: string, req: NextRequest, slug: string[]): Promise<Response | NextResponse> {
  for (const r of ROUTES) {
    const params = r.match(slug);
    if (!params) continue;
    const h = r.mod[method];
    return invoke(h, req, params);
  }
  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}
`;

  fs.writeFileSync(outFile, content, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), outFile)} (${dirs.length} routes)`);
}

main();
