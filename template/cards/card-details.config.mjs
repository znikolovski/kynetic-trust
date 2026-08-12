/**
 * Page template config for /cards/{slug} — credit card detail pages.
 *
 * Data source: AEM Content Fragment via GraphQL.
 * Mustache variables use the triple-brace {{{...}}} form only where the
 * value contains HTML (e.g. rich text fields, image URLs in src attributes).
 *
 * This file is the single source of truth for:
 *   - which blocks appear on the page and in what order
 *   - which AEM fragment fields map to which block input cells
 *   - static copy that is the same for every card
 *
 * Run `node scripts/generate-templates.mjs` to regenerate card-details.mustache.
 * Run `node scripts/preview-template-pages.mjs` to re-preview all pages after
 * a template change so the CDN serves the updated mustache-rendered HTML.
 */

const item = 'data.creditCardByPath.item';

export default {
  title: `{{${item}.name}} | Credit Card Details`,
  description: `See fees and benefits for {{${item}.name}}, including monthly fee waiver terms, cardholder fees, and foreign transaction policy.`,

  /**
   * Pages generated from this template. Used by preview-template-pages.mjs
   * to re-preview EDS pages after the mustache is regenerated.
   *
   * Two modes — use whichever fits:
   *
   *   paths    — static list; good for small, stable sets of pages.
   *
   *   discovery.graphql  — AEM GraphQL endpoint + query + JSONPath-style
   *                        field to extract slugs from the response.
   *                        The script fetches this at runtime so the list
   *                        stays current without any manual maintenance.
   *
   * Both can coexist; paths and discovered slugs are merged and deduped.
   */
  pages: {
    pathPrefix: '/cards/',
    // Static fallback — used when GraphQL discovery is unavailable or
    // as a known-good baseline alongside discovery results.
    paths: [
      '/cards/secur-bank-premium',
      '/cards/securbank-business-pro',
      '/cards/securbank-cashback-everyday',
      '/cards/securbank-secured-builder',
      '/cards/securbank-student-starter',
      '/cards/securbank-travel-elite',
    ],
    // AEM GraphQL list query to discover all cards dynamically.
    // The single-card render endpoint is:
    //   /graphql/execute.json/securbank/CreditCardDetailsByPath;path=/content/dam/securbank/en/cards/{{id}}
    // Discovery uses the companion list query (same persisted-query config
    // in AEM, different query name). If CreditCardList doesn't exist yet,
    // create it in the AEM GraphQL console using the query below.
    discovery: {
      // The auto-generated persisted CreditCardList query doesn't include
      // _path, so we use the generic GraphQL endpoint with an inline query
      // that explicitly requests it.
      endpoint: 'https://publish-p115476-e1135027.adobeaemcloud.com/content/_cq_graphql/securbank/endpoint.json',
      method: 'POST',
      query: '{ creditCardList { items { _path } } }',
      // Dot-notation into the AEM response envelope: data → model list → items → _path
      slugPath: 'data.creditCardList.items[*]._path',
      // _path looks like /content/dam/securbank/en/cards/securbank-premium
      // — the last segment becomes the EDS page slug.
    },
  },

  sections: [
    // ─── Hero ───────────────────────────────────────────────────────────────
    {
      block: 'product-hero',
      data: {
        eyebrow: 'SecurBank Cards',
        heading: `<h1><em>{{${item}.name}}</em></h1>`,
        body: `Everything you need to know about {{${item}.name}} &mdash; fees, benefits, and terms at a glance.`,
        buttons: `<p><strong><a href="/join">Apply Now</a></strong> <em><a href="/credit-cards">Compare Cards</a></em></p>`,
        image: `<img src="{{{${item}.cardImage._publishUrl}}}" alt="{{${item}.name}} credit card">`,
      },
    },

    // ─── Fees ────────────────────────────────────────────────────────────────
    {
      classes: ['surface', 'text-center'],
      defaultContent: [
        '<h2>Fees at a Glance</h2>',
        "<p>Every fee this card can charge, straight from the card's rate &amp; fee schedule.</p>",
      ],
      block: 'feature-list',
      blockClasses: ['cards'],
      data: {
        items: [
          { icon: 'payments',   heading: 'Monthly Fee',               body: `{{${item}.monthlyFee}}` },
          { icon: 'person_add', heading: 'Additional Cardholder',     body: `{{${item}.additionalCardHolderFee}}` },
          { icon: 'public',     heading: 'International Transactions', body: `{{${item}.internationalTransactionFee}}` },
        ],
      },
    },

    // ─── Benefits ────────────────────────────────────────────────────────────
    {
      classes: ['lowest', 'text-center'],
      defaultContent: ['<h2>Key Benefits</h2>'],
      block: 'feature-list',
      blockClasses: ['cards', 'center'],
      data: {
        items: [
          { icon: 'verified', heading: "What's included", body: `{{{${item}.keyBenefits.html}}}` },
        ],
      },
    },

    // ─── CTA ─────────────────────────────────────────────────────────────────
    {
      classes: ['lowest'],
      block: 'cta',
      blockClasses: ['prominent', 'centered'],
      data: {
        image:   '<img src="/media/cards-cta-bg.jpg" alt="">',
        heading: `<h2>Ready for <em>{{${item}.name}}</em>?</h2>`,
        body:    'Apply in minutes and start saving on fees today.',
        buttons: `<p><strong><a href="/join">Apply Now &rarr;</a></strong></p>`,
      },
    },

    // ─── Metadata ────────────────────────────────────────────────────────────
    {
      metadata: true,
      fields: {
        Title:       `{{${item}.name}} | Credit Card Details`,
        Description: `See fees and benefits for {{${item}.name}}, including monthly fee waiver terms, cardholder fees, and foreign transaction policy.`,
      },
    },
  ],
};
