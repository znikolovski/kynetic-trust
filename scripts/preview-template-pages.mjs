/**
 * Re-previews and publishes all EDS pages generated from mustache templates
 * so the CDN picks up the updated HTML after a template regeneration.
 *
 * Usage:
 *   DA_TOKEN=... HELIX_API_KEY=... node scripts/preview-template-pages.mjs
 *
 * Optionally limit to specific templates (by config filename without extension):
 *   DA_TOKEN=... HELIX_API_KEY=... node scripts/preview-template-pages.mjs card-details
 *
 * Page discovery per template:
 *   Each template config exports a `pages` object with:
 *     paths[]     — static list of EDS paths to preview
 *     discovery   — optional GraphQL config to fetch paths dynamically
 *                   (merged with static paths, deduped)
 *
 * Required env vars:
 *   DA_TOKEN      — Adobe IMS access token (generated via OAuth S2S in CI)
 *   HELIX_API_KEY — EDS/Helix Admin API key with preview+live role
 */

import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

function findFiles(dir, pattern) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findFiles(full, pattern));
    else if (pattern.test(entry.name)) results.push(full);
  }
  return results;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ORG = 'znikolovski';
const REPO = 'kynetic-trust';
const ADMIN = 'https://admin.hlx.page';

// ─── Page discovery ───────────────────────────────────────────────────────────

/**
 * Resolves a dot-notation path like "data.items[*].slug" against a JSON object.
 * Only supports simple dot notation and [*] wildcard (flattens arrays).
 */
function resolvePath(obj, path) {
  const parts = path.replace(/\[\*\]/g, '').split('.').filter(Boolean);
  let current = [obj];
  for (const part of parts) {
    current = current.flatMap((node) => {
      if (Array.isArray(node)) return node.map((item) => item?.[part]).filter(Boolean);
      return node?.[part] != null ? [node[part]] : [];
    });
  }
  return current.flat();
}

async function discoverPaths(discovery) {
  const { endpoint, fallbackQuery, slugPath } = discovery;

  let json;
  try {
    // AEM persisted queries are served as GET requests (no body).
    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });

    if (!res.ok && fallbackQuery) {
      // Persisted query not found — fall back to an inline POST to the
      // generic GraphQL endpoint on the same host.
      process.stderr.write(`Persisted query ${endpoint} returned ${res.status}, trying inline query.\n`);
      const url = new URL(endpoint);
      const genericEndpoint = `${url.origin}/content/_cq_graphql/${url.pathname.split('/')[3]}/endpoint.json`;
      const fallback = await fetch(genericEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: fallbackQuery }),
      });
      if (!fallback.ok) {
        process.stderr.write(`Inline GraphQL query also failed (${fallback.status}). Using static paths only.\n`);
        return [];
      }
      json = await fallback.json();
    } else if (!res.ok) {
      process.stderr.write(`GraphQL discovery returned ${res.status} from ${endpoint}. Using static paths only.\n`);
      return [];
    } else {
      json = await res.json();
    }
  } catch (err) {
    process.stderr.write(`GraphQL discovery failed: ${err.message}. Using static paths only.\n`);
    return [];
  }

  const values = resolvePath(json, slugPath);
  // _path looks like /content/dam/securbank/en/cards/securbank-infinite
  // → use the last segment as the EDS page slug.
  return values.map((v) => String(v).split('/').pop()).filter(Boolean);
}

async function collectPaths(pagesConfig) {
  const { pathPrefix = '/', paths = [], discovery } = pagesConfig;

  // Static paths — already fully qualified
  const collected = new Set(paths);

  // GraphQL-discovered slugs → prepend pathPrefix
  if (discovery) {
    const slugs = await discoverPaths(discovery);
    for (const slug of slugs) {
      collected.add(`${pathPrefix.replace(/\/$/, '')}/${slug}`);
    }
  }

  return [...collected];
}

// ─── Preview + publish ────────────────────────────────────────────────────────

async function previewAndPublish(path, headers) {
  const previewRes = await fetch(`${ADMIN}/preview/${ORG}/${REPO}/main${path}`, {
    method: 'POST',
    headers,
  });
  if (!previewRes.ok) {
    process.stderr.write(`✗ preview ${path} — HTTP ${previewRes.status}\n`);
    return false;
  }
  process.stdout.write(`✓ preview ${path}\n`);

  const liveRes = await fetch(`${ADMIN}/live/${ORG}/${REPO}/main${path}`, {
    method: 'POST',
    headers,
  });
  if (!liveRes.ok) {
    process.stderr.write(`✗ publish ${path} — HTTP ${liveRes.status}\n`);
    return false;
  }
  process.stdout.write(`✓ publish ${path}\n`);
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const daToken = process.env.DA_TOKEN;
  const helixApiKey = process.env.HELIX_API_KEY;

  if (!daToken) throw new Error('DA_TOKEN env var is required');
  if (!helixApiKey) throw new Error('HELIX_API_KEY env var is required');

  const headers = {
    Authorization: `token ${helixApiKey}`,
    'x-content-source-authorization': `Bearer ${daToken}`,
    Accept: 'application/json',
  };

  // Optional filter: only process configs whose filename matches an argument
  const filter = new Set(process.argv.slice(2).map((a) => a.toLowerCase()));

  const templateDir = resolve(ROOT, 'template');
  const configPaths = findFiles(templateDir, /\.config\.mjs$/)
    .filter((p) => {
      if (filter.size === 0) return true;
      const name = p.split('/').pop().replace('.config.mjs', '').toLowerCase();
      return filter.has(name);
    });

  if (configPaths.length === 0) {
    process.stdout.write('No matching template configs found.\n');
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const configPath of configPaths) {
    const config = (await import(configPath)).default;

    if (!config.pages) {
      process.stdout.write(`Skipping ${configPath} — no pages config defined.\n`);
      continue;
    }

    const paths = await collectPaths(config.pages);
    if (paths.length === 0) {
      process.stdout.write(`No paths to preview for ${configPath}.\n`);
      continue;
    }

    process.stdout.write(`\nPreviewing ${paths.length} page(s) from ${configPath.split('/').pop()}:\n`);
    for (const path of paths) {
      const success = await previewAndPublish(path, headers);
      if (success) ok += 1;
      else failed += 1;
    }
  }

  process.stdout.write(`\nDone: ${ok} published, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
