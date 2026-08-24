import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  toClassName,
} from './aem.js';
import {
  initMartech,
  martechEager,
  martechLazy,
} from '../plugins/martech/src/index.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

// ── Martech config ────────────────────────────────────────────────────────────

// Replace DATASTREAM_ID after creating the datastream in AEP (Experience Platform
// → Data Collection → Datastreams). Add the Analytics and Target services, then
// paste the generated Datastream ID here.
const DATASTREAM_ID = 'b7cb93b5-a5b2-4bfb-b013-c666eb5c12c1';
const IMS_ORG = '28260E2056581D3B7F000101@AdobeOrg';

const LAUNCH_URLS = ['https://assets.adobedtm.com/7bd07c5f18b6/bb012c95ae42/launch-f4bf288cfb30.min.js'];

// Populated by loadEager once martechEager resolves; read by applyTargetCTAVariant.
let eagerPropositions = [];

// ── Analytics helpers ─────────────────────────────────────────────────────────

/**
 * Reads the JSON-LD CreditCard schema injected by the edge function and pushes
 * card metadata to the ACDL before the first alloy event fires so the data
 * is included in the eager page-view hit.
 *
 * The data layer is still a plain array at this point (ACDL loads in martechLazy);
 * pushes made here are replayed by ACDL once it initialises.
 */
function pushCardContext() {
  const ldScript = document.querySelector('script[type="application/ld+json"]');
  if (!ldScript) return;
  try {
    const schema = JSON.parse(ldScript.textContent);
    if (schema['@type'] !== 'CreditCard') return;
    window.adobeDataLayer ||= [];
    window.adobeDataLayer.push({
      card: {
        name: schema.name,
        url: window.location.href,
        slug: window.location.pathname.split('/').pop(),
      },
    });
  } catch { /* ignore malformed LD+JSON */ }
}

/**
 * Reads the Target proposition captured during the eager phase and swaps CTA
 * button text if Variant B was served.  No second alloy call is made — alloy
 * deduplicates personalization requests within a page session and would return
 * empty propositions on a second sendEvent.
 */
function applyTargetCTAVariant() {
  const allItems = eagerPropositions.flatMap((p) => p.items ?? []);
  const item = allItems.find((i) => i.data?.content?.ctaText || i.data?.ctaText);
  const offer = item?.data?.content ?? item?.data;
  if (!offer?.ctaText) return;
  document.querySelectorAll('a.button[href$="/join"]').forEach((btn) => {
    btn.textContent = btn.classList.contains('accent')
      ? (offer.ctaHeroText ?? offer.ctaText)
      : offer.ctaText;
  });
}

/**
 * Wires click-tracking on all apply CTA links so Analytics captures which
 * variant the visitor clicked and on which card.
 */
function wireCardCTATracking() {
  const cardName = document.querySelector('h1')?.textContent?.trim() ?? document.title;
  document.querySelectorAll('a[href="/join"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Push to ACDL only — the Launch rule handles the alloy sendEvent.
      // Pushing directly avoids a double-fire from both this function and the rule.
      window.adobeDataLayer?.push({
        event: 'web.webInteraction.linkClicks',
        web: { webInteraction: { name: btn.textContent.trim(), type: 'other', URL: btn.href } },
        card: { name: cardName },
      });
    }, { once: true });
  });
}

// ── EDS page scaffolding ──────────────────────────────────────────────────────

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    if (a.querySelector('img')) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    // skip inline links — the <strong>/<em> wrapper must contain only this link
    const wrapper = strong || em;
    if (wrapper.textContent.trim() !== text) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Hides sections that are DA-authored metadata (plain paragraph format).
 * These sections have no block container classes and start with a "Title" paragraph.
 * @param {Element} main The main element
 */
function hideMetadataSections(main) {
  main.querySelectorAll(':scope > .section').forEach((section) => {
    const hasBlock = [...section.classList].some((c) => c !== 'section' && c.endsWith('-container'));
    if (hasBlock) return;
    const firstP = section.querySelector('.default-content-wrapper > p:first-child');
    if (firstP?.textContent.trim() === 'Title') {
      section.hidden = true;
    }
  });
}

/**
 * Client-side fallback for {{key}} placeholder replacement.
 * In production the Edge Function (functions/rates.js) has already replaced
 * all tokens server-side, so this is a no-op. On local dev and preview
 * branches without an active Edge Function it ensures tokens are still
 * replaced after /placeholders.json loads.
 * @param {Element} main The main element
 */
async function decoratePlaceholders(main) {
  // Skip only when inside a da.live iframe (EW canvas) — not when previewing
  // in a regular tab opened from DA.
  if (window !== window.top && document.referrer.includes('da.live')) return;
  let map;
  try {
    const res = await fetch('/placeholders.json');
    if (!res.ok) return;
    const { data } = await res.json();
    map = Object.fromEntries(
      data.filter((row) => row.Key).map((row) => [toClassName(row.Key), row.Value]),
    );
  } catch {
    return;
  }
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const next = node.textContent.replace(
        /\{\{([\w-]+)\}\}/g,
        (m, key) => map[key] ?? m,
      );
      if (next !== node.textContent) node.textContent = next;
    } else {
      node.childNodes.forEach(walk);
    }
  };
  walk(main);
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  hideMetadataSections(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  const isCardPage = window.location.pathname.startsWith('/cards/');

  // Push card metadata from the JSON-LD schema (injected by the edge function)
  // into the ACDL before the first alloy event so Analytics has full page context.
  if (isCardPage) pushCardContext();

  // Start martech initialisation. Personalization (Target) only runs on card
  // detail pages where the A/B activity is active — other pages pay no Target latency.
  const martechLoadedPromise = initMartech(
    {
      datastreamId: DATASTREAM_ID,
      orgId: IMS_ORG,
      // For production, replace 'in' with your CMP's consent resolution.
      defaultConsent: 'in',
    },
    {
      personalization: true,
      launchUrls: LAUNCH_URLS,
    },
  );

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    // Run martechEager (applies Target propositions) concurrently with LCP section
    // load so personalization doesn't add to the critical path beyond 1 s timeout.
    await Promise.all([
      martechLoadedPromise.then(martechEager).then((r) => {
        eagerPropositions = r?.propositions ?? [];
      }),
      loadSection(main.querySelector('.section'), waitForFirstImage),
    ]);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  decoratePlaceholders(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  // Loads ACDL, wires up alloy ↔ ACDL bridge, and fires the analytics page view.
  await martechLazy();

  // Apply any Target propositions and wire CTA tracking on all pages.
  // applyTargetCTAVariant is a no-op when no proposition was served;
  // wireCardCTATracking only attaches listeners to elements that exist.
  applyTargetCTAVariant();
  if (window.location.pathname.startsWith('/cards/')) {
    wireCardCTATracking();
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
