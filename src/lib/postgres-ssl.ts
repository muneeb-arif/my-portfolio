import fs from 'node:fs';
import path from 'node:path';

/**
 * Remove SSL-related query params from the connection string.
 * `pg` merges `parse(connectionString)` over Pool config; if `sslmode` is present, the
 * parser sets `ssl` to `{}`, which overwrites an explicit `{ ca, rejectUnauthorized }`.
 */
export function stripSslParamsFromDatabaseUrl(connectionString: string): string {
  const protoMatch = connectionString.match(/^(postgres(?:ql)?:)/i);
  const proto = protoMatch?.[0] ?? 'postgres:';
  const u = new URL(connectionString.replace(/^postgres(?:ql)?:/i, 'http:'));
  for (const k of ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert']) {
    u.searchParams.delete(k);
  }
  const qs = u.searchParams.toString();
  return `${proto}${u.host ? '//' : ''}${u.username ? `${encodeURIComponent(u.username)}` : ''}${u.password ? `:${encodeURIComponent(u.password)}` : ''}${u.username || u.password ? '@' : ''}${u.host}${u.pathname}${qs ? `?${qs}` : ''}`;
}

/** Resolve `certs/global-bundle.pem` under the project root (walk up from cwd and from this file). */
export function resolveGlobalBundlePemPath(): string {
  const tryCertsBundle = (dir: string) => path.join(dir, 'certs', 'global-bundle.pem');

  let d = process.cwd();
  for (let i = 0; i < 12 && d !== path.dirname(d); i++) {
    const p = tryCertsBundle(d);
    if (fs.existsSync(p)) return p;
    d = path.dirname(d);
  }

  d = __dirname;
  for (let i = 0; i < 12; i++) {
    const p = tryCertsBundle(d);
    if (fs.existsSync(p)) return p;
    const parent = path.dirname(d);
    if (parent === d) break;
    d = parent;
  }

  return tryCertsBundle(process.cwd());
}

export function getPgSslOptions(): { ca: string; rejectUnauthorized: boolean } {
  const caPath = resolveGlobalBundlePemPath();
  if (!fs.existsSync(caPath)) {
    throw new Error(
      'PostgreSQL SSL: missing certs/global-bundle.pem (AWS RDS combined CA bundle).',
    );
  }
  return {
    ca: fs.readFileSync(caPath, 'utf8'),
    rejectUnauthorized: true,
  };
}
