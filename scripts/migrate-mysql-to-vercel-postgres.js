#!/usr/bin/env node
/**
 * One-time MySQL → Vercel Postgres copy (after sql/postgres/schema.sql).
 * Usage: npm run migrate:mysql-to-pg [-- --dry-run]
 * Env: MYSQL_* + DATABASE_URL (load from .env and standalone-api/.env)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'standalone-api', '.env') });

const mysql = require('mysql2/promise');
const { Client } = require('pg');

const TABLE_ORDER = [
  'users',
  'domains',
  'categories',
  'domains_technologies',
  'tech_skills',
  'niche',
  'settings',
  'portfolio_config',
  'contact_queries',
  'projects',
  'project_images',
  'dynamic_sections',
  'menus',
  'admin_sections',
  'admin_section_permissions',
  'backup_files',
  'automatic_update_capabilities',
  'automatic_update_client_performance',
  'automatic_update_logs',
  'recent_automatic_activity',
  'shared_hosting_clients',
  'shared_hosting_notifications',
  'shared_hosting_updates',
  'shared_hosting_update_logs',
  'shared_hosting_update_stats',
  'theme_clients',
  'theme_updates',
  'theme_update_logs',
  'theme_update_notifications',
  'theme_update_stats',
];

async function mysqlColumns(conn, schema, table) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
    [schema, table]
  );
  return rows.map((r) => r.COLUMN_NAME);
}

async function pgColumns(client, table) {
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
    [table]
  );
  return rows.map((r) => r.column_name);
}

function normalizeForPg(col, value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return value;
}

async function tableExistsMysql(conn, schema, table) {
  const [r] = await conn.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1`,
    [schema, table]
  );
  return r.length > 0;
}

async function migrateTable(pg, mysqlConn, schema, table, dryRun) {
  if (!(await tableExistsMysql(mysqlConn, schema, table))) {
    console.log(`[skip] ${table}: not in MySQL`);
    return;
  }

  const mCols = await mysqlColumns(mysqlConn, schema, table);
  const pCols = await pgColumns(pg, table);
  const cols = mCols.filter((c) => pCols.includes(c));
  if (!cols.length) {
    console.log(`[skip] ${table}: no overlapping columns`);
    return;
  }

  const qident = (c) => `"${String(c).replace(/"/g, '""')}"`;
  const selectList = cols.map((c) => `\`${c}\``).join(',');
  const [rows] = await mysqlConn.query(`SELECT ${selectList} FROM \`${table}\``);

  console.log(`[${table}] MySQL rows: ${rows.length}`);
  if (dryRun) return;

  let conflict = '';
  if (cols.includes('id')) conflict = 'ON CONFLICT (id) DO NOTHING';
  else if (table === 'automatic_update_client_performance' && cols.includes('client_id')) {
    conflict = 'ON CONFLICT (client_id) DO NOTHING';
  }

  let ok = 0;
  let err = 0;
  for (const row of rows) {
    const vals = cols.map((c) => normalizeForPg(c, row[c]));
    const ph = vals.map((_, i) => `$${i + 1}`).join(',');
    const colSql = cols.map(qident).join(',');
    const sql = conflict
      ? `INSERT INTO ${table} (${colSql}) VALUES (${ph}) ${conflict}`
      : `INSERT INTO ${table} (${colSql}) VALUES (${ph})`;
    try {
      await pg.query(sql, vals);
      ok++;
    } catch (e) {
      err++;
      if (err <= 3) console.warn(`[${table}] row error:`, e.message);
    }
  }
  console.log(`[${table}] inserted/attempted: ${ok}, errors: ${err}`);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const schema = process.env.MYSQL_DATABASE;
  if (!schema || !process.env.DATABASE_URL) {
    console.error('MYSQL_DATABASE and DATABASE_URL are required.');
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

  console.log(dryRun ? 'DRY RUN (no writes)' : 'LIVE MIGRATION');
  for (const table of TABLE_ORDER) {
    try {
      await migrateTable(pg, mysqlConn, schema, table, dryRun);
    } catch (e) {
      console.error(`[fail] ${table}:`, e.message);
    }
  }

  await pg.end();
  await mysqlConn.end();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
