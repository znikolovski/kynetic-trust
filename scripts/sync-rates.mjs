/**
 * Syncs rates from the dashboard API into the DA placeholders sheet.
 *
 * Usage:
 *   RATES_API_KEY=... DA_TOKEN=... node scripts/sync-rates.mjs
 *
 * DA_TOKEN is an Adobe IMS access token. In CI this is generated fresh each
 * run by the workflow via the OAuth Server-to-Server client credentials grant
 * (IMS_CLIENT_ID + IMS_CLIENT_SECRET secrets) — tokens are short-lived so
 * they are never stored as secrets themselves.
 *
 * The script writes to the DA source as an HTML table (the format DA's sheet
 * editor understands), then calls the AEM Admin API to preview and publish the
 * updated document so the change propagates to the CDN immediately.
 */

const RATES_API = 'https://kynetic-trust-dashboard.vercel.app/api/rates';

const DA_ORG = 'znikolovski';
const DA_REPO = 'kynetic-trust';
const DA_PATH = 'placeholders'; // no extension — DA serves this at /placeholders.json

// DA sheets are stored at path.json — POST multipart/form-data JSON to update them.
// The HTML document at /placeholders (no extension) is unrelated; do not PUT there.
const DA_SOURCE = `https://admin.da.live/source/${DA_ORG}/${DA_REPO}/${DA_PATH}.json`;
const AEM_PREVIEW = `https://admin.hlx.page/preview/${DA_ORG}/${DA_REPO}/main/${DA_PATH}`;
const AEM_LIVE = `https://admin.hlx.page/live/${DA_ORG}/${DA_REPO}/main/${DA_PATH}`;

async function main() {
  const apiKey = process.env.RATES_API_KEY;
  const daToken = process.env.DA_TOKEN;

  if (!apiKey) throw new Error('RATES_API_KEY env var is required');
  if (!daToken) throw new Error('DA_TOKEN env var is required');

  // 1. Fetch rates from the protected dashboard API
  const ratesRes = await fetch(RATES_API, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!ratesRes.ok) {
    throw new Error(`Dashboard API returned ${ratesRes.status}: ${await ratesRes.text()}`);
  }
  const { rates } = await ratesRes.json();

  // 2. Build the DA sheet JSON payload per the DA Admin API docs.
  //    Field names in data[] become the column names served by /placeholders.json.
  const sheetData = {
    total: rates.length,
    offset: 0,
    limit: rates.length,
    data: rates.map(({ key, display }) => ({ Key: key, Value: display })),
    ':type': 'sheet',
  };

  // 3. POST to DA as multipart/form-data per the DA Admin API docs:
  //    --form 'data=@/path/to/data.json'
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(sheetData)], { type: 'application/json' }));

  const postRes = await fetch(DA_SOURCE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${daToken}` },
    body: form,
  });
  if (!postRes.ok) {
    throw new Error(`DA source POST returned ${postRes.status}: ${await postRes.text()}`);
  }

  // Verify DA stored the data correctly
  const verifyRes = await fetch(DA_SOURCE, { headers: { Authorization: `Bearer ${daToken}` } });
  const stored = await verifyRes.json();
  process.stdout.write(`DA verification: ${stored.total ?? '?'} rows stored\n`);

  // 4. Trigger EDS preview/live so the CDN picks up the change immediately
  const previewRes = await fetch(AEM_PREVIEW, {
    method: 'POST',
    headers: { Authorization: `Bearer ${daToken}` },
  });
  if (!previewRes.ok) process.stderr.write(`AEM preview returned ${previewRes.status}\n`);

  const liveRes = await fetch(AEM_LIVE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${daToken}` },
  });
  if (!liveRes.ok) process.stderr.write(`AEM live returned ${liveRes.status}\n`);

  process.stdout.write(`synced ${rates.length} rates to DA ${DA_PATH}\n`);
  rates.forEach(({ key, display }) => process.stdout.write(`  ${key}: ${display}\n`));
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
