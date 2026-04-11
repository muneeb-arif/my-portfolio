/**
 * @deprecated The app is built from the repository root. This delegates to ../scripts/generate-api-router.mjs
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootScript = path.resolve(__dirname, '../../scripts/generate-api-router.mjs');
const rootDir = path.resolve(__dirname, '../..');
const r = spawnSync(process.execPath, [rootScript], { cwd: rootDir, stdio: 'inherit' });
process.exit(r.status ?? 1);
