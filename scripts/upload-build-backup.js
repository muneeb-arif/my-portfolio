#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'api', '.env') });

async function uploadBuildBackup() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN missing in .env / api/.env');
    process.exit(1);
  }

  const buildZipPath = path.join(process.cwd(), 'build.zip');
  if (!fs.existsSync(buildZipPath)) {
    console.error('❌ build.zip not found. Run npm run build (or build-no-backup) first.');
    process.exit(1);
  }

  const stats = fs.statSync(buildZipPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `portfolio-build-${timestamp}.zip`;
  const destPath = `updates/migration-uploads/${fileName}`;
  const buf = fs.readFileSync(buildZipPath);

  const putAccess =
    String(process.env.BLOB_PUT_ACCESS || 'public').toLowerCase() === 'private' ? 'private' : 'public';
  console.log(`📦 Uploading build.zip (${fileSizeInMB} MB) → Vercel Blob ${destPath} (${putAccess})...`);
  const blob = await put(destPath, buf, {
    access: putAccess,
    token,
    contentType: 'application/zip',
  });

  console.log('');
  console.log('🎉 Uploaded:', blob.url);
  const urlsFile = path.join(process.cwd(), 'backup-urls.txt');
  fs.appendFileSync(urlsFile, `${new Date().toISOString()} - ${fileName}\n${blob.url}\n\n`);
  console.log('📝 Appended to backup-urls.txt');
}

if (require.main === module) {
  uploadBuildBackup().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { uploadBuildBackup };
