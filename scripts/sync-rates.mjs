/**
 * Syncs rates from the dashboard's committed data/rates.json into the DA
 * placeholders sheet.
 *
 * Reads directly from the GitHub raw content URL so it always reflects the
 * latest committed value, independent of whether Vercel has redeployed yet.
 *
 * Usage:
 *   DA_TOKEN=... HELIX_API_KEY=... node scripts/sync-rates.mjs
 *
 * DA_TOKEN is an Adobe IMS access token generated each run by the workflow
 * via the OAuth Server-to-Server client credentials grant.
 */

const RATES_JSON_URL =
  'https://raw.githubusercontent.com/znikolovski/kynetic-trust-dashboard/main/data/rates.json';

const DA_ORG = 'znikolovski';
const DA_REPO = 'kynetic-trust';

const DA_SOURCE = `https://admin.da.live/source/${DA_ORG}/${DA_REPO}/placeholders.json`;
// Structured data sheets use the full .json extension in the preview/live path
const AEM_PREVIEW = `https://admin.hlx.page/preview/${DA_ORG}/${DA_REPO}/main/placeholders.json`;
const AEM_LIVE = `https://admin.hlx.page/live/${DA_ORG}/${DA_REPO}/main/placeholders.json`;

async function main() {
  const daToken = process.env.DA_TOKEN;
  const helixApiKey = process.env.HELIX_API_KEY;

  if (!daToken) throw new Error('DA_TOKEN env var is required');
  if (!helixApiKey) throw new Error('HELIX_API_KEY env var is required');

  // 1. Read rates directly from the committed data/rates.json on GitHub.
  //    Using the raw URL ensures we always get the latest committed value,
  //    regardless of whether the dashboard's Vercel deployment has rebuilt yet.
  const ratesRes = await fetch(RATES_JSON_URL, { cache: 'no-store' });
  if (!ratesRes.ok) {
    throw new Error(`GitHub raw fetch returned ${ratesRes.status}`);
  }
  const ratesMap = await ratesRes.json(); // { 'standard-apy': '2.45%', ... }
  const entries = Object.entries(ratesMap);

  // 2. Build the DA sheet JSON payload per the DA Admin API docs.
  //    Field names in data[] become the column names served by /placeholders.json.
  const sheetData = {
    total: entries.length,
    offset: 0,
    limit: entries.length,
    data: entries.map(([key, display]) => ({ Key: key, Value: display })),
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

  // 4. Trigger EDS preview/live so the CDN picks up the change immediately.
  //    admin.hlx.page requires two separate credentials:
  //    - Authorization: token <HELIX_API_KEY>  (EDS/Helix Admin API key, NOT a GitHub PAT)
  //    - x-content-source-authorization: Bearer <DA_TOKEN>  (IMS token for DA content access)
  const hlxHeaders = {
    Authorization: `token ${helixApiKey}`,
    'x-content-source-authorization': `Bearer ${daToken}`,
    Accept: 'application/json',
  };

  const previewRes = await fetch(AEM_PREVIEW, { method: 'POST', headers: hlxHeaders });
  if (!previewRes.ok) process.stderr.write(`AEM preview returned ${previewRes.status}\n`);
  else process.stdout.write('EDS preview triggered\n');

  const liveRes = await fetch(AEM_LIVE, { method: 'POST', headers: hlxHeaders });
  if (!liveRes.ok) process.stderr.write(`AEM live returned ${liveRes.status}\n`);
  else process.stdout.write('EDS live triggered\n');

  process.stdout.write(`synced ${entries.length} rates to DA placeholders\n`);
  entries.forEach(([key, display]) => process.stdout.write(`  ${key}: ${display}\n`));
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
