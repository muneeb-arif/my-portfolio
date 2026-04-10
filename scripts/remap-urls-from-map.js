#!/usr/bin/env node
/**
 * Apply migration-blob-url-map.jsonl to Postgres URL columns.
 * Usage: npm run remap:urls [-- path/to/map.jsonl]
 */
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'api', '.env') });

const DEFAULT_MAP = path.join(__dirname, '..', 'migration-blob-url-map.jsonl');

async function main() {
  const mapFile = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : DEFAULT_MAP;
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL required');
    process.exit(1);
  }
  if (!fs.existsSync(mapFile)) {
    console.error('Map file not found:', mapFile);
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const rl = readline.createInterface({ input: fs.createReadStream(mapFile), crlfDelay: Infinity });
  let n = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    const { from: oldUrl, to: newUrl } = rec;
    if (!oldUrl || !newUrl) continue;

    const tables = [
      ['project_images', 'url'],
      ['niche', 'image'],
    ];

    for (const [tbl, col] of tables) {
      const r = await client.query(
        `UPDATE ${tbl} SET "${col}" = $1 WHERE "${col}" = $2`,
        [newUrl, oldUrl]
      );
      n += r.rowCount || 0;
    }
  }

  await client.end();
  console.log('Total row updates (sum across tables):', n);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
