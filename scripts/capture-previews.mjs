import { chromium } from 'playwright';

const BASE = 'https://main--kynetic-trust--znikolovski.aem.page';
const pages = [
  { url: `${BASE}/`, out: 'home.png', fullPage: true },
  { url: `${BASE}/accounts-savings`, out: 'accounts-savings.png', fullPage: true },
  { url: `${BASE}/credit-cards`, out: 'credit-cards.png', fullPage: true },
  { url: `${BASE}/compare`, out: 'compare.png', fullPage: true },
  { url: `${BASE}/mortgages`, out: 'mortgages.png', fullPage: true },
  { url: `${BASE}/register`, out: 'register.png', fullPage: true },
  { url: `${BASE}/insights/quantum-secure-banking`, out: 'article.png', fullPage: true },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const p of pages) {
  await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.error('nav error', p.url, e.message));
  await page.screenshot({ path: `.fidelity-check/${p.out}`, fullPage: p.fullPage });
  console.log('captured', p.out);
}
await browser.close();
