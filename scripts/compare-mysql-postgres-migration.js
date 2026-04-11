#!/usr/bin/env node
/**
 * Compare row coverage between MySQL (source) and Postgres (target) for migrated tables.
 * Highlights IDs present in MySQL but missing in Postgres, grouped by user_id.
 *
 * Env: MYSQL_* + DATABASE_URL (same as migrate-mysql-to-vercel-postgres.js)
 * Usage:
 *   MYSQL_HOST=... MYSQL_USER=... MYSQL_PASSWORD=... MYSQL_DATABASE=portfolio \
 *   DATABASE_URL=... node scripts/compare-mysql-postgres-migration.js
 *
 * Options:
 *   --list-missing=20   print up to N sample missing row keys per table (default 15)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', 'standalone-api', '.env') });

const mysql = require('mysql2/promise');
const { Client } = require('pg');

const ID_TABLES = [
  'categories',
  'domains_technologies',
  'tech_skills',
  'niche',
  'projects',
  'project_images',
];

function parseListMissingArg() {
  const arg = process.argv.find((a) => a.startsWith('--list-missing='));
  if (!arg) return 15;
  const n = parseInt(arg.split('=')[1], 10);
  return Number.isFinite(n) && n >= 0 ? n : 15;
}

async function mysqlIdsByUser(conn, schema, table, idCol, userCol) {
  const [rows] = await conn.query(
    `SELECT \`${idCol}\` AS id, \`${userCol}\` AS user_id FROM \`${table}\``
  );
  const byUser = new Map();
  for (const r of rows) {
    const uid = r.user_id;
    if (!byUser.has(uid)) byUser.set(uid, new Set());
    byUser.get(uid).add(String(r.id));
  }
  return { all: new Set(rows.map((r) => String(r.id))), byUser };
}

async function pgIdsByUser(client, table, idCol, userCol) {
  const { rows } = await client.query(
    `SELECT "${idCol}" AS id, "${userCol}" AS user_id FROM "${table}"`
  );
  const byUser = new Map();
  for (const r of rows) {
    const uid = r.user_id;
    if (!byUser.has(uid)) byUser.set(uid, new Set());
    byUser.get(uid).add(String(r.id));
  }
  return { all: new Set(rows.map((r) => String(r.id))), byUser };
}

/** Settings: MySQL uses `key` / `value`; Postgres uses setting_key / setting_value */
async function compareSettings(mysqlConn, pg, listLimit) {
  const [mysqlRows] = await mysqlConn.query(
    'SELECT user_id, `key` AS k, id FROM settings'
  );
  const { rows: pgRows } = await pg.query(
    'SELECT user_id, setting_key AS k, id FROM settings'
  );
  const pgKeys = new Set(pgRows.map((r) => `${r.user_id}::${r.k}`));
  const missing = mysqlRows.filter((r) => !pgKeys.has(`${r.user_id}::${r.k}`));
  const mysqlTotal = mysqlRows.length;
  const pgTotal = pgRows.length;

  console.log('\n--- settings (matched on user_id + key / setting_key) ---');
  console.log(`MySQL rows: ${mysqlTotal}, Postgres rows: ${pgTotal}`);
  console.log(`MySQL keys missing in Postgres: ${missing.length}`);
  if (missing.length && listLimit > 0) {
    const sample = missing.slice(0, listLimit);
    console.log('Sample missing (user_id, key, mysql id):');
    sample.forEach((r) => console.log(`  ${r.user_id} | ${r.k} | ${r.id}`));
  }

  const orphanPg = pgRows.filter((r) => {
    const hit = mysqlRows.some((m) => m.user_id === r.user_id && m.k === r.k);
    return !hit;
  });
  if (orphanPg.length) {
    console.log(`Postgres-only setting keys (not in MySQL by user+key): ${orphanPg.length}`);
  }
}

function printTableDiff(name, mysqlData, pgData, listLimit) {
  const missing = [...mysqlData.all].filter((id) => !pgData.all.has(id));
  const extra = [...pgData.all].filter((id) => !mysqlData.all.has(id));

  console.log(`\n--- ${name} ---`);
  console.log(`MySQL rows: ${mysqlData.all.size}, Postgres rows: ${pgData.all.size}`);
  console.log(`Missing in Postgres (by id): ${missing.length}`);
  console.log(`Extra in Postgres (not in MySQL): ${extra.length}`);

  if (missing.length && listLimit > 0) {
    const byUser = new Map();
    for (const uid of mysqlData.byUser.keys()) {
      const set = mysqlData.byUser.get(uid);
      for (const id of set) {
        if (!pgData.all.has(id)) {
          if (!byUser.has(uid)) byUser.set(uid, []);
          byUser.get(uid).push(id);
        }
      }
    }
    console.log('Missing counts per user_id:');
    [...byUser.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([uid, ids]) => console.log(`  ${uid}: ${ids.length}`));

    console.log(`Sample missing ids (up to ${listLimit}):`);
    missing.slice(0, listLimit).forEach((id) => console.log(`  ${id}`));
  }
}

async function main() {
  const listLimit = parseListMissingArg();
  const schema = process.env.MYSQL_DATABASE;
  if (!schema || !process.env.DATABASE_URL) {
    console.error('MYSQL_DATABASE and DATABASE_URL are required (see example.env).');
    process.exit(1);
  }

  const mysqlConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: schema,
  });

  const pg = new Client({ connectionString: process.env.DATABASE_URL });
  await pg.connect();

  console.log('MySQL → Postgres migration diff');
  console.log(`MySQL: ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || 3306}/${schema}`);

  for (const table of ID_TABLES) {
    try {
      const mysqlData = await mysqlIdsByUser(mysqlConn, schema, table, 'id', 'user_id');
      const pgData = await pgIdsByUser(pg, table, 'id', 'user_id');
      printTableDiff(table, mysqlData, pgData, listLimit);
    } catch (e) {
      console.error(`\n[${table}] ${e.message}`);
    }
  }

  try {
    await compareSettings(mysqlConn, pg, listLimit);
  } catch (e) {
    console.error(`\n[settings] ${e.message}`);
  }

  console.log(
    '\nNote: If settings show large gaps, the migrator only copies columns with the same name; MySQL `key`/`value` do not map to Postgres `setting_key`/`setting_value` automatically. Fix by a one-off SQL or script that maps those columns.'
  );

  await pg.end();
  await mysqlConn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
