#!/usr/bin/env node
/**
 * Registers the Placeholder Picker as a library plugin in the DA site config.
 *
 * Usage:
 *   DA_TOKEN=<ims-token> node scripts/setup-da-config.mjs
 *
 * The DA_TOKEN is a short-lived IMS access token — generate one the same way
 * the sync-rates workflow does (OAuth S2S client credentials grant), or grab
 * it from the Network tab in a logged-in DA session.
 *
 * Idempotent: safe to run multiple times; existing library rows are preserved
 * and the Placeholder Picker row is upserted by title.
 */

const ORG = 'znikolovski';
const SITE = 'kynetic-trust';
const PREVIEW_BASE = `https://main--${SITE}--${ORG}.aem.page`;
const CONFIG_URL = `https://admin.da.live/config/${ORG}/${SITE}`;

const PLUGIN_ROW = {
  title: 'Placeholder Picker',
  path: `${PREVIEW_BASE}/tools/placeholder-picker/placeholder-picker.html`,
  experience: 'dialog',
};

// Reserved DA built-in titles that must not appear as custom library rows.
const DA_RESERVED = new Set(['blocks', 'templates', 'aem-assets', 'icons', 'placeholders']);

async function getConfig(token) {
  const res = await fetch(CONFIG_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET config → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function saveConfig(token, config, exists) {
  const form = new FormData();
  form.append('config', JSON.stringify(config));
  const method = exists ? 'POST' : 'PUT';
  const res = await fetch(CONFIG_URL, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`${method} config → ${res.status}: ${await res.text()}`);
  return res.json();
}

function buildLibrarySheet(existing) {
  const rows = (existing?.library?.data || [])
    .filter((r) => r.title && !DA_RESERVED.has(r.title.trim().toLowerCase().replaceAll(' ', '-')));

  // Upsert the plugin row by title
  const idx = rows.findIndex((r) => r.title === PLUGIN_ROW.title);
  if (idx >= 0) rows[idx] = { ...rows[idx], ...PLUGIN_ROW };
  else rows.push(PLUGIN_ROW);

  return {
    ':type': 'sheet',
    columns: ['title', 'path', 'format', 'ref', 'icon', 'experience'],
    total: rows.length,
    data: rows,
  };
}

function buildConfig(existing) {
  const librarySheet = buildLibrarySheet(existing);

  // Preserve all existing sheets; merge/add library
  if (existing?.[':type'] === 'multi-sheet') {
    const names = existing[':names'] || [];
    if (!names.includes('library')) names.push('library');
    const out = { ...existing, library: librarySheet, ':names': names };
    return out;
  }

  // No existing config or single-sheet — build a minimal multi-sheet wrapper
  const data = existing?.data || {
    ':type': 'sheet', columns: ['key', 'value'], total: 0, data: [],
  };
  const permissions = existing?.permissions || {
    ':type': 'sheet',
    columns: ['path', 'actions', 'groups'],
    total: 2,
    data: [
      { path: 'CONFIG', actions: 'write', groups: '*' },
      { path: '/**', actions: 'read,write', groups: '*' },
    ],
  };
  return {
    data,
    permissions,
    library: librarySheet,
    ':names': ['data', 'permissions', 'library'],
    ':type': 'multi-sheet',
  };
}

async function main() {
  const token = process.env.DA_TOKEN;
  if (!token) throw new Error('DA_TOKEN env var is required');

  process.stdout.write(`Fetching current config for ${ORG}/${SITE}…\n`);
  const existing = await getConfig(token);

  const config = buildConfig(existing);
  process.stdout.write(`${existing ? 'Updating' : 'Creating'} site config…\n`);
  await saveConfig(token, config, !!existing);

  const rows = config.library?.data || [];
  process.stdout.write(`Done. Library sheet now has ${rows.length} row(s):\n`);
  rows.forEach((r) => process.stdout.write(`  [${r.experience || 'inline'}] ${r.title} → ${r.path}\n`));
  process.stdout.write('\nReload the DA editor to see the Placeholder Picker in the Library panel.\n');
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
