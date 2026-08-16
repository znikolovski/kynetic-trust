/**
 * AEM Edge Function — placeholder resolution + JSON-LD schema injection
 *
 * 1. Replaces {{key}} tokens with values from /placeholders.json so rates and
 *    copy appear in the initial HTML without client-side flicker.
 *
 * 2. Injects JSON-LD structured data sourced from AEM GraphQL for credit card
 *    pages, making the content machine-readable by LLMs and search engines:
 *
 *    /credit-cards   → schema.org ItemList of all CreditCard items
 *    /cards/{slug}   → schema.org CreditCard with full fee and benefit detail
 *
 * Both paths degrade gracefully: if the AEM GraphQL call fails the page still
 * renders normally without structured data.
 */

const AEM_GQL = 'https://publish-p115476-e1135027.adobeaemcloud.com';
const AEM_GQL_ENDPOINT = `${AEM_GQL}/content/_cq_graphql/securbank/endpoint.json`;

// Mirrors aem.js toClassName() so placeholder keys resolve identically.
function toClassName(name) {
  return name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ── AEM GraphQL helpers ───────────────────────────────────────────────────────

async function gqlPost(query) {
  try {
    const res = await fetch(AEM_GQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchCardList() {
  const json = await gqlPost(`{
    creditCardList {
      items {
        _path
        name
        monthlyFee
        additionalCardHolderFee
        internationalTransactionFee
        keyBenefits { html }
      }
    }
  }`);
  return json?.data?.creditCardList?.items ?? [];
}

async function fetchCardDetail(slug) {
  try {
    // AEM persisted query format uses semicolon-delimited params with literal path values.
    const path = `/content/dam/securbank/en/cards/${slug}`;
    const res = await fetch(
      `${AEM_GQL}/graphql/execute.json/securbank/CreditCardDetailsByPath;path=${path}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.creditCardByPath?.item ?? null;
  } catch {
    return null;
  }
}

// ── JSON-LD builders ──────────────────────────────────────────────────────────

function stripHtml(html) {
  return (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Escapes <, >, & so a CMS string containing "</script>" can't break the tag.
function safeJsonStringify(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

const PROVIDER = {
  '@type': 'BankOrCreditUnion',
  name: 'SecurBank',
  url: 'https://www.securbank.run.place',
};

function cardToSchema(card, cardUrl) {
  const schema = {
    '@type': 'CreditCard',
    name: card.name,
    url: cardUrl,
    provider: PROVIDER,
    feesAndCommissionsSpecification: [
      `Monthly fee: ${card.monthlyFee}`,
      `Additional cardholder fee: ${card.additionalCardHolderFee}`,
      `International transaction fee: ${card.internationalTransactionFee}`,
    ].join('. '),
  };
  if (card.cardImage?._publishUrl) schema.image = card.cardImage._publishUrl;
  const benefits = stripHtml(card.keyBenefits?.html);
  if (benefits) schema.description = benefits;
  return schema;
}

async function buildListSchema(origin) {
  const cards = await fetchCardList();
  if (!cards.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'SecurBank Credit Cards',
    description: 'Compare all SecurBank credit cards — fees, benefits, and eligibility at a glance.',
    url: `${origin}/credit-cards`,
    itemListElement: cards.map((card, i) => {
      const slug = card._path.split('/').pop();
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: cardToSchema(card, `${origin}/cards/${slug}`),
      };
    }),
  };
}

async function buildDetailSchema(slug, pageUrl) {
  const card = await fetchCardDetail(slug);
  if (!card) return null;
  return {
    '@context': 'https://schema.org',
    ...cardToSchema(card, pageUrl),
  };
}

function injectJsonLd(html, schema) {
  const tag = `<script type="application/ld+json">${safeJsonStringify(schema)}</script>`;
  const idx = html.indexOf('</head>');
  if (idx === -1) return html + tag;
  return html.slice(0, idx) + tag + html.slice(idx);
}

// ── Edge handler ──────────────────────────────────────────────────────────────

export default async function handler(request, context) {
  const response = await context.next();

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) return response;

  try {
    const url = new URL(request.url);

    // Decide which JSON-LD schema to build for this path (null = none).
    let schemaPromise = null;
    if (url.pathname === '/credit-cards') {
      schemaPromise = buildListSchema(url.origin);
    } else if (url.pathname.startsWith('/cards/')) {
      const slug = url.pathname.split('/').filter(Boolean).pop();
      if (slug) schemaPromise = buildDetailSchema(slug, request.url);
    }

    // Fetch placeholders, read HTML body, and fetch structured data in parallel.
    const [placeholdersRes, html, schema] = await Promise.all([
      fetch(`${url.origin}/placeholders.json`),
      response.text(),
      schemaPromise ?? Promise.resolve(null),
    ]);

    let body = html;

    // Placeholder token replacement.
    if (placeholdersRes.ok) {
      const { data } = await placeholdersRes.json();
      const map = Object.fromEntries(
        data
          .filter((row) => row.Key && row.Text)
          .map((row) => [toClassName(row.Key), row.Text]),
      );
      body = body.replace(/\{\{([\w-]+)\}\}/g, (m, key) => map[key] ?? m);
    }

    // JSON-LD injection.
    if (schema) {
      body = injectJsonLd(body, schema);
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return response;
  }
}
