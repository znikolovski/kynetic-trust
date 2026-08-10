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

const DA_SOURCE = `https://admin.da.live/source/${DA_ORG}/${DA_REPO}/${DA_PATH}`;
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

  // 2. Build the HTML document DA expects for a sheet.
  //    DA stores sheets as a flat <table> (no thead/tbody) inside a full HTML
  //    document. EDS reads the first <tr> as column headers and subsequent
  //    rows as data, producing { data: [{ Key, Text }] } at /placeholders.json.
  const rows = rates
    .map(({ key, display }) => `<tr><td>${key}</td><td>${display}</td></tr>`)
    .join('\n');
  const html = `<html><body><table>\n<tr><th>Key</th><th>Text</th></tr>\n${rows}\n</table></body></html>`;

  // 3. Write to DA source
  const putRes = await fetch(DA_SOURCE, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${daToken}`,
      'Content-Type': 'text/html',
    },
    body: html,
  });
  if (!putRes.ok) {
    throw new Error(`DA source PUT returned ${putRes.status}: ${await putRes.text()}`);
  }

  // 4. Preview then publish so the CDN picks up the change immediately
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
