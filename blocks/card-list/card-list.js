import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * Live credit card catalog. Fetches the card lineup from an AEM GraphQL
 * persisted query and renders it as a card grid.
 *
 * Authored row (optional): [endpoint URL]. Leave empty (or omit the row
 * entirely) to use the SecurBank "AllCreditCards" persisted query below —
 * the override exists so authors/QA can point at a different environment
 * (e.g. an author-tier endpoint for draft content) without a code change.
 *
 * Confirmed response shape (publish-tier `AllCreditCards` persisted query,
 * a `creditCardList` query against the "creditCard" Content Fragment Model
 * that also backs `creditCardByPath`, consumed by
 * template/cards/card-details.mustache):
 *   { data: { creditCardList: { items: [{
 *     name,
 *     cardImage: { _publishUrl, _dynamicUrl },
 *     keyBenefits: { plaintext },
 *   }] } } }
 * No fee fields or path/slug field are present on this query — the detail
 * link below is reconstructed from `name` (see slugFor). `monthlyFee` /
 * `internationalTransactionFee` / `keyBenefits.html` are still read
 * opportunistically in case a differently-configured persisted query
 * includes them (that richer shape matches `creditCardByPath`).
 */

const DEFAULT_ENDPOINT = 'https://publish-p115476-e1135027.adobeaemcloud.com/graphql/execute.json/securbank/AllCreditCards';
const FETCH_TIMEOUT_MS = 8000;
const MAX_BENEFITS = 4;

/** Pulls the first array-of-items out of an unknown GraphQL `data` object. */
function findItems(payload) {
  const data = payload?.data;
  if (!data) return [];
  const withItems = Object.values(data).find((v) => Array.isArray(v?.items));
  if (withItems) return withItems.items;
  return Object.values(data).find((v) => Array.isArray(v)) || [];
}

/**
 * Best-effort detail-page slug. No path/slug field is returned by this
 * query, so fall back to the name with the "SecurBank " brand prefix
 * stripped — matches the one confirmed live page, /credit-cards/premium
 * (from "SecurBank PREMIUM").
 */
function slugFor(item) {
  // eslint-disable-next-line no-underscore-dangle -- AEM system field name
  const pathLike = item.slug || item.urlKey || item._path || item.path;
  if (pathLike) {
    const last = String(pathLike).split('/').filter(Boolean).pop();
    if (last) return toClassName(last);
  }
  const name = (item.name || item.title || '').replace(/^securbank\s+/i, '');
  return toClassName(name) || 'card';
}

/** Rich HTML benefits (creditCardByPath shape), or blank-line-separated
 *  plaintext benefits (AllCreditCards shape). */
function firstBenefits(item, max = MAX_BENEFITS) {
  const html = item.keyBenefits?.html;
  if (html) {
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const listed = [...wrap.querySelectorAll('li')].map((li) => li.textContent.trim()).filter(Boolean);
    if (listed.length) return listed.slice(0, max);
  }
  const plain = item.keyBenefits?.plaintext || item.keyBenefits || item.benefits;
  if (!plain || typeof plain !== 'string') return [];
  return plain.split(/\n{2,}/).map((line) => line.trim()).filter(Boolean).slice(0, max);
}

function buildStat(label, value) {
  const stat = document.createElement('div');
  stat.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
  return stat;
}

function buildCard(item) {
  const name = item.name || item.title || 'SecurBank Card';
  // eslint-disable-next-line no-underscore-dangle -- AEM asset delivery field name
  const imgSrc = item.cardImage?._publishUrl || item.cardImage?.url
    // eslint-disable-next-line no-underscore-dangle -- AEM asset delivery field name
    || item.image?._publishUrl || item.image?.url;
  const href = `/credit-cards/${slugFor(item)}`;

  const card = document.createElement('div');
  card.className = 'card-list-item glass-card';

  const media = document.createElement('div');
  media.className = 'card-list-media';
  if (imgSrc) media.append(createOptimizedPicture(imgSrc, name, false, [{ width: '400' }]));
  card.append(media);

  const body = document.createElement('div');
  body.className = 'card-list-body';

  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'SecurBank Cards';
  body.append(eyebrow);

  const heading = document.createElement('h3');
  heading.textContent = name;
  body.append(heading);

  const stats = document.createElement('div');
  stats.className = 'card-list-stats';
  if (item.monthlyFee) stats.append(buildStat('Monthly Fee', item.monthlyFee));
  if (item.internationalTransactionFee) {
    stats.append(buildStat('Intl. Transactions', item.internationalTransactionFee));
  }
  if (stats.children.length) body.append(stats);

  const benefits = firstBenefits(item);
  if (benefits.length) {
    const ul = document.createElement('ul');
    ul.className = 'card-list-benefits';
    benefits.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.append(li);
    });
    body.append(ul);
  }

  const actions = document.createElement('p');
  actions.className = 'button-wrapper';
  actions.innerHTML = `<strong><a href="${href}">View Details</a></strong> <em><a href="/join">Apply Now</a></em>`;
  body.append(actions);

  card.append(body);
  return card;
}

function renderStatus(grid, message, tone, link) {
  grid.innerHTML = '';
  const status = document.createElement('div');
  status.className = `card-list-status card-list-status-${tone}`;
  status.setAttribute('role', 'status');
  const p = document.createElement('p');
  p.textContent = message;
  status.append(p);
  if (link) {
    const a = document.createElement('a');
    a.className = 'button secondary';
    a.href = link.href;
    a.textContent = link.text;
    status.append(a);
  }
  grid.append(status);
}

export default async function decorate(block) {
  const rows = [...block.children];
  const endpoint = rows[0]?.textContent.trim() || DEFAULT_ENDPOINT;
  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'card-list-grid';
  grid.setAttribute('aria-busy', 'true');
  block.append(grid);
  renderStatus(grid, 'Loading credit cards…', 'loading');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = findItems(await res.json());

    if (!items.length) {
      renderStatus(grid, 'No credit cards are available right now.', 'empty');
    } else {
      grid.innerHTML = '';
      items.forEach((item) => grid.append(buildCard(item)));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('card-list: failed to load credit cards', error);
    renderStatus(
      grid,
      'We could not load the live card catalog. Please try again shortly.',
      'error',
      { href: '/credit-cards', text: 'View Credit Cards' },
    );
  } finally {
    clearTimeout(timeout);
    grid.removeAttribute('aria-busy');
  }
}
