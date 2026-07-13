# Kinetic Trust — SecurBank EDS site overlay

This adds the "Kinetic Trust 2 / Neon Glass" design system and a full block
library on top of the stock `adobe/aem-boilerplate` already scaffolded at
`github.com/znikolovski/kynetic-trust`. It covers the home, accounts &
savings, credit cards, tier comparison, and editorial-article pages from
`stitch_securbank_bold_reimagined_design/`.

## What's in here

```
styles/styles.css        Design tokens + base element styles (replaces boilerplate defaults)
styles/fonts.css          @font-face rules for Hanken Grotesk / Geist / JetBrains Mono
blocks/header/            Sticky glass top nav, reads content from /nav
blocks/footer/            Multi-column footer, reads content from /footer
blocks/fragment/          Standard EDS fragment loader (required by header/footer)
blocks/hero/               Full-bleed marketing hero (home page)
blocks/offer-grid/         Asymmetric bento card grid ("Popular offers & services")
blocks/stat-panel/         Small glass stat chip (e.g. "5.85% APY")
blocks/cta/                Reusable CTA banner (centered or split variant)
blocks/feature-list/       Icon + heading + body repeating list
blocks/product-hero/       Large glass hero for product pages (Cards, Accounts)
blocks/pricing-tiers/      3-tier pricing/membership cards
blocks/comparison-table/   Accessible N-column feature-matrix table
blocks/article-header/     Editorial hero (image, byline, dek)
blocks/pull-quote/         Editorial pull-quote
blocks/related-articles/   Related-content card grid
blocks/nextjs-widget/      Loads a Next.js-built interactive widget as a progressive enhancement (see below)
content/                   DA-authorable HTML for nav, footer, and 5 pages
widgets.json               Committed, PR-reviewed pin of which widget build is currently live (see below)
.github/workflows/         widget-release.yml (opens the release PR) + ci.yml (gates it)
test/widget-preview.mjs    Playwright check that verifies a release PR's live aem.live preview
```

## How content authoring works (unchanged for authors)

Nothing here changes how content authors work in **Document Authoring
(da.live)** or the **Universal Editor** — that's a hard requirement from the
project brief. Every visual block above is driven entirely by content the
author types into a table in da.live (or pastes from Word/Google Docs); the
JS in each `blocks/*/*.js` only *decorates* that authored HTML into the final
markup. Authors never touch CSS or JS.

Two authoring conventions used throughout, both already built into
`aem-boilerplate`'s `scripts/scripts.js`:

- **Buttons**: wrap a link in `**bold**` for a primary (solid cyan) button,
  `*italic*` for a secondary (outline) button.
- **Accent text in headings**: wrap a word in `*em*` (no link) to get the
  glowing cyan accent, e.g. `Sail Into *Financial* Independence`.

Each block's authoring model (which row means what) is documented as a
comment at the top of its `.js` file.

## Where Next.js shows up on this site (`nextjs-widget`)

The `/compare` page's technical-matrix table is both a normal, static
`comparison-table` block (server-rendered, crawlable, always present) *and*,
once the page has settled, a live `sb-widget-comparison-table` custom element
built and served by the Next.js app in `../kynetic-trust-dashboard/widgets/`.
The static table is authored right before a `nextjs-widget` block in
`content/compare.html`:

```html
<div class="nextjs-widget">
  <div><div>comparison-table</div></div>  <!-- widget name -->
  <div><div>tiers</div></div>             <!-- dataset id -->
  <div><div></div></div>                  <!-- app origin override, optional -->
</div>
```

`blocks/nextjs-widget/nextjs-widget.js` lazy-loads the widget: by default it
fetches this repo's own committed `/widgets.json` (not anything cross-origin)
to resolve the current content-hashed script, loads that script, mounts the
custom element it defines, and only swaps out the static table once that
widget confirms it has live data (a `sb-widget-ready` event). If
`widgets.json`, the script, or the data fetch fails or is slow, visitors
simply keep the static table. This is why the comparison table specifically
was worth doing this way: it's the one piece of content on the public site
that benefits from a live, personalized, client-computed view (the widget
adds a balance slider that recalculates projected yield per tier) that a
cached, anonymous EDS page can't itself provide — everything else on the
site stays plain EDS on purpose.

### `widgets.json` is a real release, not a background sync

Unlike a runtime-resolved manifest, `widgets.json` only changes via a normal,
reviewable pull request — opened *automatically* by
`kynetic-trust-dashboard`'s CI (`repository_dispatch` → this repo's
`.github/workflows/widget-release.yml`) whenever it ships a widget change,
but never merged automatically-and-blindly: this repo's own `ci.yml` runs a
`widget-preview-check` job that loads the PR's real `aem.live` preview and
confirms the widget genuinely mounts cross-origin against the dashboard's
production API before the PR is allowed to merge (auto-merge is only
*enabled*, not unconditional). That job also posts a commit status back onto
the *dashboard's* originating commit, so neither repo ships blind to the
other's outcome.

Net effect: nothing reaches `securbank.com` visitors until this PR merges —
that merge commit is the single, git-blameable answer to "when did this
widget version go live." See `../ARCHITECTURE.md` §3.5 for the full flow and
`../kynetic-trust-dashboard/README.md` for the dashboard side.

An app-origin override authored directly on a draft page still resolves
`{origin}/widgets/manifest.json` live from any dashboard deployment (e.g. a
PR preview) — that path is a local/iteration convenience only, never how
production content resolves a widget.

## Deploying this (why it isn't live yet)

This session has read-only access to `github.com/znikolovski/kynetic-trust`
(via the GitHub REST API) and no da.live/AEM Cloud Service credentials, so it
could not push code or content directly. To go live:

1. **Code**: copy `styles/`, `blocks/`, `widgets.json`, `test/`, and this
   file into the repo root (they only *add* new files and replace the two
   stock `styles/*.css` files — nothing else in the boilerplate changes),
   commit, and push to `main`. `aem-code-sync` picks it up automatically.
   `package.json` is the one exception — it's not purely additive here
   (added `playwright` as a devDependency for `test/widget-preview.mjs`), so
   merge it with the repo's real `package.json` rather than overwriting.
2. **Content**: use the `aem-edge-delivery-services:da-auth` and `da-content`
   skills (or paste directly in da.live's UI) to create `/nav`, `/footer`,
   `/index`, `/accounts-savings`, `/credit-cards`, `/compare`, and
   `/insights/quantum-secure-banking` from the files in `content/`.
3. **Fonts**: `styles/fonts.css` currently ships accurate fallback metrics
   but no real `.woff2` binaries (none were available in this session).
   Download licensed Hanken Grotesk, Geist, and JetBrains Mono woff2 files
   into `/fonts` and the `@font-face` rules will pick them up with no other
   changes — this is the one step required to hit a *guaranteed* 100
   Lighthouse Performance score (self-hosted, no third-party font requests).
4. **CI secrets**: add a `DASHBOARD_REPO_TOKEN` repo secret here (a PAT
   scoped to write commit statuses on `kynetic-trust-dashboard`) so
   `ci.yml`'s `widget-preview-check` can report back onto the originating
   dashboard commit. `widget-release.yml` uses the default `GITHUB_TOKEN`
   for the PR itself, which needs "Read and write permissions" + "Allow
   GitHub Actions to create and approve pull requests" enabled under
   Settings → Actions → General.
5. **Preview**: run `aem up` locally (aem-cli) against this repo to verify
   block rendering before pushing, per the `preview-import` skill.

See `../ARCHITECTURE.md` for how this site relates to the Next.js dashboard
and AEM Cloud Service.
