/**
 * Previews and publishes site pages in AEM so the CDN picks up the latest
 * content from DA immediately.
 *
 * Usage:
 *   DA_TOKEN=... HELIX_API_KEY=... node scripts/preview-pages.mjs [path ...]
 *
 * Paths are relative to the site root (no leading slash), e.g.:
 *   node scripts/preview-pages.mjs index accounts-savings credit-cards
 *
 * If no paths are given, defaults to the set defined in DEFAULT_PAGES.
 */

const ORG = 'znikolovski';
const REPO = 'kynetic-trust';
const ADMIN = `https://admin.hlx.page`;

const DEFAULT_PAGES = [
  'index',
  'accounts-savings',
  'credit-cards',
  'compare',
  'mortgages',
];

async function previewAndPublish(path, headers) {
  const previewUrl = `${ADMIN}/preview/${ORG}/${REPO}/main/${path}`;
  const liveUrl = `${ADMIN}/live/${ORG}/${REPO}/main/${path}`;

  const previewRes = await fetch(previewUrl, { method: 'POST', headers });
  if (!previewRes.ok) {
    process.stderr.write(`✗ preview ${path} — HTTP ${previewRes.status}\n`);
    return false;
  }
  process.stdout.write(`✓ preview ${path}\n`);

  const liveRes = await fetch(liveUrl, { method: 'POST', headers });
  if (!liveRes.ok) {
    process.stderr.write(`✗ publish ${path} — HTTP ${liveRes.status}\n`);
    return false;
  }
  process.stdout.write(`✓ publish ${path}\n`);
  return true;
}

async function main() {
  const daToken = process.env.DA_TOKEN;
  const helixApiKey = process.env.HELIX_API_KEY;

  if (!daToken) throw new Error('DA_TOKEN env var is required');
  if (!helixApiKey) throw new Error('HELIX_API_KEY env var is required');

  const pages = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_PAGES;

  const headers = {
    Authorization: `token ${helixApiKey}`,
    'x-content-source-authorization': `Bearer ${daToken}`,
    Accept: 'application/json',
  };

  let ok = 0;
  let failed = 0;

  for (const page of pages) {
    const success = await previewAndPublish(page, headers);
    if (success) ok += 1;
    else failed += 1;
  }

  process.stdout.write(`\nDone: ${ok} published, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
