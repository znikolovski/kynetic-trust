/**
 * Syncs rates from the dashboard API into placeholders.json.
 *
 * Usage (requires RATES_API_KEY env var):
 *   node scripts/sync-rates.mjs
 *
 * Run by .github/workflows/sync-rates.yml on a schedule and on
 * repository_dispatch events from kynetic-trust-dashboard.
 */

import { writeFileSync, readFileSync } from 'node:fs';

const RATES_API = 'https://kynetic-trust-dashboard.vercel.app/api/rates';
const OUTPUT = 'placeholders.json';

async function main() {
  const apiKey = process.env.RATES_API_KEY;
  if (!apiKey) throw new Error('RATES_API_KEY env var is required');

  const res = await fetch(RATES_API, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`Dashboard API returned ${res.status}: ${await res.text()}`);
  }

  const { rates } = await res.json();

  const data = rates.map(({ key, display }) => ({ Key: key, Text: display }));
  const placeholders = {
    total: data.length,
    offset: 0,
    limit: 256,
    data,
  };

  const next = `${JSON.stringify(placeholders, null, 2)}\n`;

  let current = '';
  try { current = readFileSync(OUTPUT, 'utf8'); } catch { /* first run */ }

  if (current === next) {
    process.stdout.write('placeholders.json is already up to date\n');
    return;
  }

  writeFileSync(OUTPUT, next);
  process.stdout.write(`wrote ${data.length} rates to ${OUTPUT}\n`);
  data.forEach(({ Key, Text }) => process.stdout.write(`  ${Key}: ${Text}\n`));
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
