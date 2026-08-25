/**
 * Previews (and optionally publishes) all block library pages defined in
 * tools/sidekick/library.json so the sidekick block library can render them.
 *
 * Usage:
 *   DA_TOKEN=... HELIX_API_KEY=... node scripts/preview-block-library.mjs
 *   DA_TOKEN=... HELIX_API_KEY=... node scripts/preview-block-library.mjs --publish
 *
 * Required env vars:
 *   DA_TOKEN      — Adobe IMS access token (from your DA session)
 *   HELIX_API_KEY — EDS/Helix Admin API key with preview+live role
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ORG = 'znikolovski';
const REPO = 'kynetic-trust';
const ADMIN = 'https://admin.hlx.page';
const PUBLISH = process.argv.includes('--publish');

const daToken = process.env.DA_TOKEN;
const helixApiKey = process.env.HELIX_API_KEY;

if (!daToken) throw new Error('DA_TOKEN env var is required');
if (!helixApiKey) throw new Error('HELIX_API_KEY env var is required');

const headers = {
  Authorization: `token ${helixApiKey}`,
  'x-content-source-authorization': `Bearer ${daToken}`,
  Accept: 'application/json',
};

const library = JSON.parse(
  readFileSync(resolve(ROOT, 'tools/sidekick/library.json'), 'utf-8'),
);

const paths = library.data.map((b) => b.path).filter(Boolean);

process.stdout.write(`Previewing ${paths.length} block library page(s)${PUBLISH ? ' + publishing' : ''}…\n\n`);

let ok = 0;
let failed = 0;

for (const path of paths) {
  const previewRes = await fetch(`${ADMIN}/preview/${ORG}/${REPO}/main${path}`, {
    method: 'POST',
    headers,
  });
  if (!previewRes.ok) {
    process.stderr.write(`✗ preview ${path} — HTTP ${previewRes.status}\n`);
    failed += 1;
    continue;
  }
  process.stdout.write(`✓ preview ${path}\n`);

  if (PUBLISH) {
    const liveRes = await fetch(`${ADMIN}/live/${ORG}/${REPO}/main${path}`, {
      method: 'POST',
      headers,
    });
    if (!liveRes.ok) {
      process.stderr.write(`✗ publish ${path} — HTTP ${liveRes.status}\n`);
      failed += 1;
      continue;
    }
    process.stdout.write(`✓ publish ${path}\n`);
  }

  ok += 1;
}

process.stdout.write(`\nDone: ${ok} succeeded, ${failed} failed\n`);
if (failed > 0) process.exit(1);
