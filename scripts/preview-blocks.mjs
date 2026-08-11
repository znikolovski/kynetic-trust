/**
 * Previews all block HTML examples and library manifests in DA so they appear
 * correctly in the DA Experience Workspace block library.
 *
 * Run manually:   DA_TOKEN=... HELIX_API_KEY=... node scripts/preview-blocks.mjs
 * In CI:         DA_TOKEN is generated from IMS_CLIENT_ID + IMS_CLIENT_SECRET.
 */

const ORG = 'znikolovski';
const REPO = 'kynetic-trust';
const BASE = `https://admin.hlx.page/preview/${ORG}/${REPO}/main`;

const PATHS = [
  // Block HTML examples
  'blocks/hero/hero',
  'blocks/product-hero/product-hero',
  'blocks/feature-list/feature-list',
  'blocks/offer-grid/offer-grid',
  'blocks/pricing-tiers/pricing-tiers',
  'blocks/cta/cta',
  'blocks/cards/cards',
  'blocks/columns/columns',
  'blocks/stat-panel/stat-panel',
  'blocks/pull-quote/pull-quote',
  'blocks/comparison-table/comparison-table',
  'blocks/article-header/article-header',
  'blocks/tags/tags',
  'blocks/related-articles/related-articles',
  'blocks/mortgage-calculator/mortgage-calculator',
  'blocks/fragment/fragment',
  'blocks/nextjs-widget-comparison-table/nextjs-widget-comparison-table',
  'blocks/nextjs-widget-transaction-summary/nextjs-widget-transaction-summary',
  'blocks/nextjs-widget-mortgage-calculator/nextjs-widget-mortgage-calculator',
  'blocks/nextjs-widget-login-modal/nextjs-widget-login-modal',
  'blocks/nextjs-widget-registration-flow/nextjs-widget-registration-flow',
  // Page templates
  'templates/home/home',
  'templates/product-page/product-page',
  'templates/editorial-article/editorial-article',
  'templates/landing-page/landing-page',
  // Library manifests (use .json extension — structured data sheets)
  'library/blocks.json',
  'library/templates.json',
];

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

  let ok = 0;
  let failed = 0;

  for (const path of PATHS) {
    const url = `${BASE}/${path}`;
    const res = await fetch(url, { method: 'POST', headers });
    if (res.ok) {
      process.stdout.write(`✓ ${path}\n`);
      ok += 1;
    } else {
      process.stderr.write(`✗ ${path} — HTTP ${res.status}\n`);
      failed += 1;
    }
  }

  process.stdout.write(`\nDone: ${ok} previewed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
