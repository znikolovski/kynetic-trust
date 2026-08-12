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
 */

const item = 'data.creditCardByPath.item';

export default {
  title: `{{${item}.name}} | Credit Card Details`,
  description: `See fees and benefits for {{${item}.name}}, including monthly fee waiver terms, cardholder fees, and foreign transaction policy.`,

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
