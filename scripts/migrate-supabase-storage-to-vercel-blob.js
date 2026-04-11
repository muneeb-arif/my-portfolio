#!/usr/bin/env node
/**
 * Copy Supabase Storage objects → Vercel Blob. Appends url pairs to migration-blob-url-map.jsonl
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (recommended), BLOB_READ_WRITE_TOKEN
 * Optional: BLOB_PUT_ACCESS=public|private (default public; set private if the Blob store is private)
 * Usage: npm run migrate:supabase-to-blob [-- --bucket=images]
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { put } = require('@vercel/blob');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'standalone-api', '.env') });

const BUCKETS_DEFAULT = ['images', 'avatars', 'documents', 'domains', 'updates'];

async function walkFiles(supabase, bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;
  const out = [];
  for (const item of data || []) {
    const p = prefix ? `${prefix}/${item.name}` : item.name;
    const isFile = item.metadata != null && item.metadata.size != null;
    if (isFile) {
      out.push(p);
    } else {
      const sub = await walkFiles(supabase, bucket, p);
      out.push(...sub);
    }
  }
  return out;
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!url || !key || !token) {
    console.error('Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or anon), BLOB_READ_WRITE_TOKEN');
    process.exit(1);
  }

  const argBucket = process.argv.find((a) => a.startsWith('--bucket='))?.split('=')[1];
  const buckets = argBucket ? [argBucket] : BUCKETS_DEFAULT;

  const putAccess =
    String(process.env.BLOB_PUT_ACCESS || 'public').toLowerCase() === 'private' ? 'private' : 'public';
  console.log(`Vercel Blob put access: ${putAccess}`);

  const supabase = createClient(url, key);
  const mapPath = path.join(__dirname, '..', 'migration-blob-url-map.jsonl');
  const logStream = fs.createWriteStream(mapPath, { flags: 'a' });

  for (const bucket of buckets) {
    console.log(`Bucket: ${bucket}`);
    let paths;
    try {
      paths = await walkFiles(supabase, bucket, '');
    } catch (e) {
      console.warn(`Skip ${bucket}:`, e.message);
      continue;
    }

    for (const objectPath of paths) {
      try {
        const { data, error } = await supabase.storage.from(bucket).download(objectPath);
        if (error) throw error;
        const buf = Buffer.from(await data.arrayBuffer());
        const dest = `${bucket}/${objectPath.replace(/^\/+/, '')}`;
        const blob = await put(dest, buf, { access: putAccess, token });
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
        logStream.write(JSON.stringify({ from: pub.publicUrl, to: blob.url, pathname: dest }) + '\n');
        console.log('OK', dest);
      } catch (e) {
        console.error('FAIL', bucket, objectPath, e.message);
      }
    }
  }

  logStream.end();
  console.log('Done. Map:', mapPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
