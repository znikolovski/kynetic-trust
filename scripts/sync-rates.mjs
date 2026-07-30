/**
 * Syncs rates from the dashboard API into the DA placeholders document.
 *
 * Usage (requires both env vars):
 *   RATES_API_KEY=... DA_TOKEN=... node scripts/sync-rates.mjs
 *
 * DA_TOKEN is an Adobe IMS access token for an account with write access
 * to the znikolovski/kynetic-trust DA repository. For CI, use a service
 * account token via Adobe Developer Console (OAuth Server-to-Server).
 *
 * Run by .github/workflows/sync-rates.yml on a schedule and on
 * repository_dispatch "rates-changed" events from kynetic-trust-dashboard.
 */

const RATES_API = 'https://kynetic-trust-dashboard.vercel.app/api/rates';

const DA_ORG = 'znikolovski';
const DA_REPO = 'kynetic-trust';
const DA_PATH = 'placeholders.json';

const DA_SOURCE = `https://admin.da.live/source/${DA_ORG}/${DA_REPO}/${DA_PATH}`;
const DA_PREVIEW = `https://admin.da.live/preview/${DA_ORG}/${DA_REPO}/${DA_PATH}`;
const DA_LIVE = `https://admin.da.live/live/${DA_ORG}/${DA_REPO}/${DA_PATH}`;

async function main() {
  const apiKey = process.env.RATES_API_KEY;
  const daToken = process.env.DA_TOKEN;

  if (!apiKey) throw new Error('RATES_API_KEY env var is required');
  if (!daToken) throw new Error('DA_TOKEN env var is required');

  // Fetch rates from the protected dashboard API
  const ratesRes = await fetch(RATES_API, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!ratesRes.ok) throw new Error(`Dashboard API returned ${ratesRes.status}: ${await ratesRes.text()}`);

  const { rates } = await ratesRes.json();
  const data = rates.map(({ key, display }) => ({ Key: key, Text: display }));
  const body = JSON.stringify({
    total: data.length, offset: 0, limit: 256, data,
  }, null, 2);

  // Write to DA
  const putRes = await fetch(DA_SOURCE, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${daToken}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!putRes.ok) throw new Error(`DA source PUT returned ${putRes.status}: ${await putRes.text()}`);

  // Preview → then publish to live
  const previewRes = await fetch(DA_PREVIEW, {
    method: 'POST',
    headers: { Authorization: `Bearer ${daToken}` },
  });
  if (!previewRes.ok) process.stderr.write(`DA preview returned ${previewRes.status}\n`);

  const liveRes = await fetch(DA_LIVE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${daToken}` },
  });
  if (!liveRes.ok) process.stderr.write(`DA live returned ${liveRes.status}\n`);

  process.stdout.write(`synced ${data.length} rates to DA ${DA_PATH}\n`);
  data.forEach(({ Key, Text }) => process.stdout.write(`  ${Key}: ${Text}\n`));
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
