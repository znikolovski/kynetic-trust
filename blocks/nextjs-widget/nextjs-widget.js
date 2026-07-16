/**
 * Progressive-enhancement loader for a Next.js-built interactive widget
 * (see kynetic-trust-dashboard/widgets/*.tsx). This is how the EDS site
 * "blends in" Next.js for the handful of components that genuinely need a
 * live, personalized, client-computed experience — a comparison table with
 * a live rate estimator is the first case — WITHOUT giving up EDS's
 * cacheable, no-JS-required rendering for everyone else:
 *
 *  1. Authors keep authoring a normal, real EDS block right before this one
 *     (e.g. `comparison-table`) — that stays server-rendered, crawlable,
 *     and is what every visitor sees by default.
 *  2. This block lazy-loads (only once scrolled near-viewport, well after
 *     LCP) a small external script that defines a custom element.
 *  3. Only once that widget successfully fetches its live data does it
 *     signal `sb-widget-ready`, at which point — and only then — the
 *     static fallback is hidden and the live widget takes its place.
 *  4. Any failure (script blocked, dashboard down, offline) leaves the
 *     static fallback exactly as authored. Nothing ever regresses below
 *     "normal EDS block."
 *
 * Authored rows: [widget name], [dataset param (optional)],
 * [app origin override (optional — see version resolution below)].
 *
 * Version resolution — two modes:
 *
 *  - Default (no origin override authored): fetch this site's OWN
 *    `/widgets.json`, a file committed to THIS repo (not the dashboard's),
 *    and load whatever version it currently pins. That file is only ever
 *    changed by a PR opened automatically by the dashboard repo's release
 *    workflow when it ships a widget change, and that PR only merges once
 *    this repo's own CI has verified the new version actually works against
 *    a live EDS preview (see `.github/workflows/widget-release.yml` and
 *    ARCHITECTURE.md §3.5). In other words: production here is an explicit,
 *    reviewed, git-tracked release — never a background config refresh.
 *  - Override authored (a specific app origin, e.g. a dashboard PR's Vercel
 *    preview URL): fetch `{origin}/widgets/manifest.json` LIVE from that
 *    origin instead. This is purely a testing convenience — it lets an
 *    author or developer preview an unreleased widget build on a draft EDS
 *    page before its release PR even exists, without touching `widgets.json`.
 */

const READY_TIMEOUT_MS = 6000;
const RESOLVE_TIMEOUT_MS = 3000;

function loadScript(src) {
  return new Promise((resolveScript, rejectScript) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolveScript();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => resolveScript();
    script.onerror = () => rejectScript(new Error(`Failed to load widget script: ${src}`));
    document.head.append(script);
  });
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Production path: this site's own committed, PR-reviewed pin. */
async function resolvePinned(widgetName) {
  const registry = await fetchJson('/widgets.json');
  const entry = registry[widgetName];
  if (!entry?.file || !entry?.appOrigin) throw new Error(`no widgets.json entry for "${widgetName}"`);
  return { appOrigin: entry.appOrigin, scriptUrl: `${entry.appOrigin}${entry.file}` };
}

/** Preview path: an explicitly authored origin override, resolved live. */
async function resolvePreview(appOrigin, widgetName) {
  const manifest = await fetchJson(`${appOrigin}/widgets/manifest.json`);
  const entry = manifest.widgets?.[widgetName];
  if (!entry?.file) throw new Error(`no manifest entry for "${widgetName}" at ${appOrigin}`);
  return { appOrigin, scriptUrl: `${appOrigin}${entry.file}` };
}

export default function decorate(block) {
  const rows = [...block.children];
  const [nameRow, datasetRow, originRow] = rows;
  const widgetName = nameRow?.textContent.trim();
  const datasetId = datasetRow?.textContent.trim() || 'tiers';
  const originOverride = originRow?.textContent.trim();

  if (!widgetName) return;

  // the static block this widget should replace once it's live — authored
  // as the immediately preceding block in the same section.
  // EDS wraps each block in its own div, so walk up to the wrapper first.
  const fallback = block.parentElement?.previousElementSibling ?? block.previousElementSibling;

  block.textContent = '';
  const mount = document.createElement('div');
  mount.className = 'nextjs-widget-mount';
  mount.hidden = true;
  block.append(mount);

  const tagName = `sb-widget-${widgetName}`;

  const activate = () => {
    // Priority: authored override → localhost auto-dev → committed prod pin.
    // On localhost the block always resolves live from the Next.js dev server
    // so widgets.json only ever needs production values.
    const isLocalDev = window.location.hostname === 'localhost';
    const resolved = originOverride
      ? resolvePreview(originOverride, widgetName)
      : isLocalDev
        ? resolvePreview('http://localhost:3001', widgetName)
        : resolvePinned(widgetName);

    resolved
      .then(({ appOrigin, scriptUrl }) => loadScript(scriptUrl).then(() => appOrigin))
      .then((appOrigin) => {
        const el = document.createElement(tagName);
        el.dataset.datasetId = datasetId;
        el.dataset.apiBase = appOrigin;

        const timeout = setTimeout(() => {
          // never arrived — leave the static fallback in place.
          el.remove();
        }, READY_TIMEOUT_MS);

        el.addEventListener('sb-widget-ready', () => {
          clearTimeout(timeout);
          mount.hidden = false;
          fallback?.remove();
        }, { once: true });

        mount.append(el);
      })
      .catch(() => {
        // leave the static fallback exactly as authored
      });
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      activate();
    }
  }, { rootMargin: '200px 0px' });
  observer.observe(block);
}
