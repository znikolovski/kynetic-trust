#!/usr/bin/env node
/**
 * Runs against a REAL aem.live preview deployment of this repo (see
 * .github/workflows/ci.yml's widget-preview-check job). Confirms the
 * `nextjs-widget` block on /compare actually resolves this PR's
 * widgets.json, loads the widget from the dashboard's real origin
 * (genuinely cross-origin — this is the one check that exercises that
 * path end to end), and swaps out the static fallback once ready.
 *
 * Usage: node test/widget-preview.mjs https://<branch>--kynetic-trust--znikolovski.aem.page/compare
 */
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('Usage: widget-preview.mjs <EDS preview URL for /compare>');
  process.exit(1);
}

const READY_TIMEOUT_MS = 15_000; // generous: covers manifest fetch + script load + data fetch

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // The static fallback must exist and be visible before the widget mounts.
  const fallbackVisibleBefore = await page.locator('.comparison-table').first().isVisible();
  if (!fallbackVisibleBefore) {
    console.error('FAIL: static .comparison-table fallback was not visible on initial load');
    process.exit(1);
  }

  // Force the widget to activate immediately rather than waiting on the
  // IntersectionObserver's real scroll trigger — a deliberate, minimal
  // deviation from real user behavior, kept to a single documented line.
  await page.evaluate(() => {
    document.querySelector('.nextjs-widget')?.scrollIntoView();
  });

  const readyEl = page.locator('[class^="sb-widget-"]');
  await readyEl.waitFor({ state: 'attached', timeout: READY_TIMEOUT_MS });

  await page.waitForFunction(
    () => {
      const el = document.querySelector('.nextjs-widget-mount [class^="sb-widget-"]');
      const rows = el?.shadowRoot?.querySelectorAll('tbody tr');
      return rows && rows.length > 0;
    },
    { timeout: READY_TIMEOUT_MS },
  );

  const fallbackHiddenAfter = await page.locator('.comparison-table').first().isHidden();
  if (!fallbackHiddenAfter) {
    console.error('FAIL: widget reported rows but the static fallback was never hidden');
    process.exit(1);
  }

  if (pageErrors.length) {
    console.error('Page errors during check:', pageErrors);
    process.exit(1);
  }

  console.log(`OK: widget mounted with live data and fallback swap worked on ${url}`);
} finally {
  await browser.close();
}
