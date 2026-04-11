#!/usr/bin/env node
/**
 * Interactive shared_hosting_updates row + optional manual package URL.
 * Requires DATABASE_URL (Postgres). Notifications RPC removed — use dashboard if needed.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');
const crypto = require('crypto');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'standalone-api', '.env') });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

const isValidVersion = (v) => /^\d+\.\d+\.\d+$/.test(v);

async function uploadUpdatePackage() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL required');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('\n🏗️ Shared Hosting Update (Postgres)\n');
    const packagePath = await ask('📦 Path to ZIP (or empty to skip file): ');
    let packageUrl = '';
    let packageSizeMB = '0';
    if (packagePath && fs.existsSync(packagePath)) {
      packageSizeMB = (fs.statSync(packagePath).size / (1024 * 1024)).toFixed(2);
      packageUrl = await ask('🔗 Public download URL for this ZIP: ');
    } else if (packagePath) {
      throw new Error(`File not found: ${packagePath}`);
    } else {
      packageUrl = await ask('🔗 Public package URL: ');
    }
    if (!packageUrl.startsWith('http')) {
      throw new Error('Package URL must start with http(s)://');
    }

    let version;
    do {
      version = await ask('📋 Version (e.g. 1.2.0): ');
      if (!isValidVersion(version)) console.log('Use semantic version major.minor.patch');
    } while (!isValidVersion(version));

    const title = await ask('📝 Title: ');
    const description = (await ask('📄 Description (optional): ')) || '';
    const releaseNotes = (await ask('📄 Release notes (optional, one line): ')) || '';
    const specialInstructions = (await ask('🔧 Special instructions (optional): ')) || '';
    const channel = (await ask('📢 Channel stable/beta/alpha [stable]: ')) || 'stable';
    const isCritical = (await ask('🚨 Critical? y/N: ')).toLowerCase() === 'y';

    const id = crypto.randomUUID();
    const filesJson = JSON.stringify([{ url: packageUrl }]);

    await client.query(
      `INSERT INTO shared_hosting_updates (
        id, title, description, version, files, release_notes, package_url,
        special_instructions, channel, is_critical, is_active, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,true,NOW(),NOW())`,
      [
        id,
        title,
        description || releaseNotes || 'Update',
        version,
        filesJson,
        releaseNotes || null,
        packageUrl,
        specialInstructions || null,
        channel,
        isCritical,
      ]
    );

    console.log('\n✅ Inserted shared_hosting_updates id=', id);
  } finally {
    rl.close();
    await client.end();
  }
}

async function listUpdates() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT id, title, version, channel, is_active, created_at FROM shared_hosting_updates ORDER BY created_at DESC LIMIT 20`
  );
  rows.forEach((u, i) => console.log(`${i + 1}. ${u.title} v${u.version} [${u.channel}] ${u.is_active ? 'active' : 'off'}`));
  await client.end();
}

async function listClients() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT domain, current_version, last_seen FROM shared_hosting_clients WHERE is_active = true ORDER BY last_seen DESC LIMIT 50`
  );
  rows.forEach((c, i) => console.log(`${i + 1}. ${c.domain} v${c.current_version} seen ${c.last_seen}`));
  await client.end();
}

const args = process.argv.slice(2);
if (args.includes('--list-updates')) {
  listUpdates().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else if (args.includes('--list-clients')) {
  listClients().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else if (args.includes('--help') || args.includes('-h')) {
  console.log('node scripts/upload-update-package.js           # interactive');
  console.log('node scripts/upload-update-package.js --list-updates');
  console.log('node scripts/upload-update-package.js --list-clients');
  process.exit(0);
} else {
  uploadUpdatePackage().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
