#!/usr/bin/env node
/**
 * Upload Sidekick block library snippets to Document Authoring so the
 * Helix Admin API can preview them at their extensionless CDN paths.
 *
 * Reads the cached IMS token written by the AEM CLI.
 * If no token is found, run: aem content clone --path /
 *
 * Usage:
 *   node tools/sidekick/sync-library-to-da.mjs
 *   node tools/sidekick/sync-library-to-da.mjs --preview   (also triggers Helix preview)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORG = 'znikolovski';
const SITE = 'kynetic-trust';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const ALSO_PREVIEW = process.argv.includes('--preview');

// ── Token ─────────────────────────────────────────────────────────────────────

function getToken() {
  const candidates = [
    join(ROOT, '.hlx/.da-token.json'),
    `${process.env.HOME}/.aem/da-token.json`,
    `${process.env.HOME}/.aem/ims-token.json`,
  ];
  for (const p of candidates) {
    try {
      const raw = JSON.parse(readFileSync(p, 'utf8'));
      const token = raw.access_token || raw.imsToken;
      const expires = raw.expires_at || (raw.imsTokenExpiry && raw.imsTokenExpiry * 1000);
      if (token && (!expires || expires > Date.now() + 60_000)) return token;
    } catch { /* try next */ }
  }
  return null;
}

const token = getToken();
if (!token) {
  process.stderr.write('No DA/IMS token found. Run: aem content clone --path /\n');
  process.exit(1);
}

// ── File discovery ─────────────────────────────────────────────────────────────

function walkHtml(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walkHtml(abs, files);
    else if (name.endsWith('.html')) files.push(abs);
  }
  return files;
}

const blocksDir = join(ROOT, 'tools/sidekick/blocks');
const uploads = walkHtml(blocksDir).map((abs) => ({
  abs,
  daPath: `tools/sidekick/blocks/${basename(abs)}`,
}));

// ── Upload to DA ──────────────────────────────────────────────────────────────

async function putHtml(daPath, html) {
  const form = new FormData();
  form.append('data', new Blob([html], { type: 'text/html' }), basename(daPath));
  const res = await fetch(`https://admin.da.live/source/${ORG}/${SITE}/${daPath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PUT ${daPath} → ${res.status}: ${body.slice(0, 200)}`);
  }
}

// ── Helix Admin preview ───────────────────────────────────────────────────────

async function helixPreview(path) {
  const res = await fetch(
    `https://admin.hlx.page/preview/${ORG}/${SITE}/main/${path}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    process.stderr.write(`  ⚠ preview ${path} — HTTP ${res.status}\n`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

process.stdout.write(`Uploading ${uploads.length} block snippet(s) to ${ORG}/${SITE}…\n\n`);

let ok = 0;
let failed = 0;

for (const { abs, daPath } of uploads) {
  try {
    const html = readFileSync(abs, 'utf8');
    await putHtml(daPath, html);
    process.stdout.write(`✓ ${daPath}\n`);

    if (ALSO_PREVIEW) {
      const previewPath = daPath.replace(/\.html$/, '');
      await helixPreview(previewPath);
    }
    ok += 1;
  } catch (err) {
    process.stderr.write(`✗ ${daPath}: ${err.message}\n`);
    failed += 1;
  }
}

process.stdout.write(`\nDone: ${ok} uploaded, ${failed} failed\n`);
if (ALSO_PREVIEW) {
  process.stdout.write(`\nPreview complete. Refresh the block library in the sidekick.\n`);
}
if (failed > 0) process.exit(1);
