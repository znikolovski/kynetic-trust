---
target: securbank-site (all 5 pages)
total_score: 13
p0_count: 2
p1_count: 3
timestamp: 2026-07-13T05-55-01Z
slug: securbank-site
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | No loading, progress, or feedback states anywhere. CTA buttons have no spinner, no success/error state. Apply Now links go to /join (404) with no indication of process length. |
| 2 | Match System / Real World | 1 | APY contradiction: 5.85% on home vs 5.15% on accounts-savings — same product, two different headline numbers. '£0 Annual Fee' on credit-cards.html in a USD site. 'Kinetic Lattice,' 'Cold Storage Custody,' 'Algorithmic API Access' undefined in conversion-driving comparison table. |
| 3 | User Control and Freedom | 2 | No breadcrumbs on any subpage. No contextual path from product pages to tier comparison. No "not sure which tier?" escape valve on any conversion screen. |
| 4 | Consistency and Standards | 1 | CTA block button decoration fails across accounts-savings, credit-cards, and home split CTA — `<strong>`/`<em>`-wrapped anchors render as monospace eyebrow badges, not pill buttons. Four competing CTA verbs ('Get The Offer,' 'Apply Now,' 'Apply Today,' 'Get Special Offer') with no deliberate hierarchy. |
| 5 | Error Prevention | 1 | Mortgage offer-card email input has no label, no placeholder, no submit affordance, no format validation. Every primary CTA across all five pages resolves to /join — which returns a 404. |
| 6 | Recognition Rather Than Recall | 2 | Feature-list icons (lock, speed, visibility, payments, flight_takeoff, phone_iphone) not resolving — all render as filled grey circles. Eliminates the primary scanability benefit of icon-led feature layouts across all five pages. |
| 7 | Flexibility and Efficiency of Use | 1 | No skip-to-content link, no keyboard shortcuts, no table sorting, no anchor-link shortcuts from product pages to tier comparison. Pricing-tiers page is the site's highest-value decision surface but is unreachable from within product pages. |
| 8 | Aesthetic and Minimalist Design | 2 | `--glass-bg` at rgb(255 255 255 / 3%) is imperceptibly different from obsidian — the Neon Glass brand identity is invisible at deployed opacity. Home offer-grid presents four products at equal visual weight with no editorial priority signal. |
| 9 | Error Recovery | 1 | No error states designed or implemented anywhere. No form validation feedback, no 404 handling for /join, no fallback when icons fail to load, no empty-state for article hero (results in 85vh blank obsidian above article title). |
| 10 | Help and Documentation | 1 | No tooltips, no glossary, no contextual help at any decision point. 'Algorithmic API Access' and 'Cold Storage Custody' drive the $499/mo Institutional conversion decision with zero definition. |
| **Total** | | **13/40** | **Poor — Major UX overhaul required; core conversion experience broken** |

## Anti-Patterns Verdict

**Does this look AI-generated?** Yes — strongly and immediately.

**LLM assessment**: Three compounding signals. (1) **Copy template**: every headline follows a 'Verb Your [Noun]' structure ('Sail Into Financial Independence,' 'Empower Your Capital,' 'Earn. Grow. Secure.') with jargon stacked to self-parody ('kinetic lattice systems,' 'high-frequency institutional capital'). (2) **Structural monotony**: all five pages share identical DNA — eyebrow → H1 → subtext → CTA → feature-list → comparison → CTA — with zero compositional deviation except the Compare hero, which is the strongest moment on the site precisely because it breaks the template. (3) **Editorial incoherence**: 5.85% APY on home vs 5.15% on accounts-savings, '£0 Annual Fee' in a USD-denominated site — fingerprints of content generated page-by-page in isolation with no integrating editorial pass. The visual execution is technically competent (token system correct, type pairing appropriate) but there is no art director's hand in the compositional choices.

**Deterministic scan** (exit code 2, 4 findings):
- `side-tab` × 1: `blocks/pull-quote/pull-quote.css:5` — `border-left: 4px solid var(--color-primary)`, the canonical AI-UI tell banned by the absolute rules
- `overused-font` × 3: Geist declared twice in `styles/fonts.css` and once in `styles/styles.css` — three detector hits but effectively one design decision (slightly overstated by the counter)

**Manual ban check** — confirmed violations:
- **Glassmorphism overuse**: `.glass-card` applied across 8 blocks plus nav header; `backdrop-filter: blur(12px)` is the default treatment for every interactive surface. The nav blurs at 20px (not the --glass-blur token), creating an undeclared inconsistency. Systemic glassmorphism with no hierarchy.
- **Hero-metric template**: `product-hero` and `stat-panel` are functionally duplicate blocks implementing the identical pattern (uppercase mono label → 40px/900 number → muted sublabel). Both appear on accounts-savings and credit-cards, creating a double-stamp of the same atom.
- **Identical card grids**: `offer-grid` and `pricing-tiers` share identical internal DOM structure and nearly identical visual treatment (glass-card, 32px padding, border-radius, eyebrow + heading + body + CTA). The mechanical difference is span math, not design differentiation.
- **Eyebrow on every section**: 7 blocks independently define `text-transform: uppercase` + `letter-spacing: 0.08-0.1em` at 11–13px, each inline without a shared token or class. No single place exists to change the eyebrow style site-wide. Tier eyebrows on compare.html ('Tier 01/02/03') add zero-padded ordinal AI scaffold on top of the pattern.
- **Pull-quote side-stripe**: `border-left: 4px solid var(--color-primary)` — the one instance is in the pull-quote block. The detector confirmed it.

**Contrast check**: Both body text (#e2e2e8) and muted text (#b9cacb) pass WCAG AA against obsidian (#0a0c10) at 15.17:1 and 11.53:1 respectively. Color contrast is not a problem. The glass card opacity is.

**Visual overlays**: No browser automation available; CLI scan and manual review used in place.

## Overall Impression

The Kinetic Trust 2 design system has real bones — the color token architecture is clean, the compare page hero is genuinely striking, and the comparison table implementation is the site's strongest functional UI. But the site is currently running with its conversion layer broken: every primary CTA either renders as typographic decoration rather than an interactive button, or resolves to a 404. A user who wants to apply cannot apply. The Neon Glass brand identity — the thing that makes this site distinctive — is invisible at 3% opacity. The strongest single design decision in the project (the 120px 'Select Your Velocity.' headline) is buried three clicks from the entry point.

## What's Working

**1. Compare page typographic direction**: `.section.compare-hero h1` at `clamp(72px, 10vw, 120px)` with `-0.04em` letter-spacing and `0.9` line-height is a genuine design statement. 'Select Your Velocity.' with cyan on 'Velocity.' is the one moment the Kinetic Trust brand feels kinetic. The pricing-tiers block below it is the cleanest, best-structured page on the site.

**2. Color token system architecture**: The CSS custom property hierarchy (obsidian → surface → container → on-surface → primary → secondary) is well-conceived and consistently applied. The semantic aliases correctly separate meaning from value. The cyan aura and violet aura box-shadow tokens are the right abstraction for glow effects.

**3. Comparison table implementation**: The `comparison-table` block correctly differentiates the highlighted column via `.comparison-col-highlight` with cyan text, uses `.comparison-check` (tertiary lime) and `.comparison-dash` (outline grey) with sufficient contrast, and row hover at 2% white is appropriately subtle. Both the accounts-savings 2-col and the compare 4-col table render cleanly and are the site's strongest functional UI.

## Priority Issues

**[P0] CTA block button decoration failure — primary conversion actions render as eyebrow badges**
- **Why it matters**: Every conversion endpoint on accounts-savings, credit-cards, and the home split CTA is broken. `<strong>`/`<em>`-wrapped anchors are not being decorated by `decorateButtons()` after block transformation. The result ('APPLY NOW EXPLORE PERKS' as a single uppercase mono label) reads as decorative chrome rather than an interactive control. A user who wants to open an account cannot find the button.
- **Fix**: Audit `blocks/cta/cta.js` — verify `decorateButtons()` is called on the block element *after* DOM transformation, not before. The strong/em → `.button.primary/.secondary` mapping must run against the final rendered DOM.
- **Suggested command**: `/impeccable polish` (after fixing the root JS bug)

**[P0] APY data contradiction — 5.85% on home vs 5.15% on accounts-savings**
- **Why it matters**: These are the site's most prominent selling numbers. A user who clicks from the home offer-grid into accounts-savings sees the headline rate drop 70 basis points with no explanation. For a product targeting sophisticated capital allocators, a factual contradiction in the headline metric destroys credibility before /join.
- **Fix**: Establish one authoritative APY figure. If both rates are real (promotional vs. standard), label them differently ('Intro Rate' vs 'Standard APY') with a disclosure. Do not present two different numbers for the same product across two pages without context.
- **Suggested command**: `/impeccable harden`

**[P1] Feature-list icons not rendering — all icon slots show as filled grey circles**
- **Why it matters**: Material Symbols icon name strings (lock, speed, visibility, payments, flight_takeoff, phone_iphone, public, tune, verified_user) stored in block cells are not resolving to visual glyphs. This affects every feature-list block across all five pages. The icon-circle at 56px is the visual anchor for each feature card; without it the cards lead with a grey blob that signals broken UI.
- **Fix**: Audit `feature-list.js` — confirm it is either loading the Material Symbols font and inserting `<span class='material-symbols-rounded'>` elements, or resolving icon names to SVG files in `/icons/`. Verify the icon path fallback handles both `picture` and `img` EDS formats.
- **Suggested command**: `/impeccable fix feature-list icon pipeline`

**[P1] Article hero 85vh blank — hero image absent, no fallback**
- **Why it matters**: `article-header.css` sets `min-height: 85vh` with the image as an absolute background. When `/media/quantum-secure-hero.jpg` fails to load, the user sees a vast empty dark rectangle before the article title. This is the coldest possible editorial first impression — the exact opposite of the full-bleed cinematic hero the block is designed to produce.
- **Fix**: Confirm `/media/quantum-secure-hero.jpg` is committed to the correct EDS asset path. Add a CSS fallback background (radial gradient in Kinetic Trust brand colors) so the block never renders as a blank void when the image is absent.
- **Suggested command**: `/impeccable fix article-header.css fallback background`

**[P1] Pull-quote block renders as unstyled body text — decoration not applying**
- **Why it matters**: The pull-quote.css is correctly authored (cyan left border, italic cyan h2, mono attribution cite) but the quote text and attribution render as plain body copy run directly into the preceding paragraph. The block decoration is not applying the structural transformation needed to produce `.pull-quote h2` and `cite` elements. The detector confirmed the border-left side-stripe on this block separately — a ban violation that becomes irrelevant if the block isn't rendering at all.
- **Fix**: Audit `pull-quote.js` — verify `decorate()` wraps first cell content in `<h2>` and second in `<cite>`, appended into the `.pull-quote` root. CSS targets `.pull-quote h2` and `.pull-quote cite` specifically; the raw div children won't match.
- **Suggested command**: `/impeccable fix pull-quote.js decoration`

**[P2] Glass card opacity too low — Neon Glass identity invisible at runtime**
- **Why it matters**: `--glass-bg` at `rgb(255 255 255 / 3%)` is imperceptibly different from the obsidian background (#0a0c10) and barely visible on surface (#111318). The 'Neon Glass' brand motif is the core visual identity promise but is not legible at deployed opacity. The detector confirmed `.glass-card` is applied to 8 blocks — the systemic underexpression collapses the entire visual identity.
- **Fix**: Raise `--glass-bg` to `rgb(255 255 255 / 6-8%)` and `--glass-border` to `rgb(255 255 255 / 15%)`. Audit every section wrapping a glass card and confirm it has the `.surface` class. The nav blurs at 20px inline instead of the `--glass-blur` token (12px) — align to the token.
- **Suggested command**: `/impeccable bolder` (specifically targeting glass card expressiveness)

**[P2] Currency inconsistency — '£0 Annual Fee' on credit-cards.html in a USD site**
- **Why it matters**: `credit-cards.html` line 17 reads 'Variable APR 9.99% · Annual Fee £0.' Mixing GBP into a USD-denominated site signals geographic incoherence. For a product claiming operation in 42 countries, this signals carelessness to any careful reader.
- **Fix**: Change '£0' to '$0' or 'Annual Fee: None'. If the site genuinely targets UK users, the entire pricing infrastructure needs localization — not one symbol.
- **Suggested command**: `/impeccable harden`

**[P3] No trust or regulatory signals at conversion points**
- **Why it matters**: Every Apply Now CTA is unanchored by reassurance. 'SEC Regulated' copy exists but renders as a styled badge that looks like a UI label. No FDIC notice, no encryption indicator, no '5-Minute Application' adjacent to any form. Institutional capital allocators — the stated audience — require regulatory provenance at the moment of commitment.
- **Fix**: Add a micro-trust row below every primary CTA: 3–4 small icon+label pairs ('SEC Regulated,' 'AES-256 Encrypted,' '5-Minute Application') at 12px mono, as inline elements not badge components.
- **Suggested command**: `/impeccable harden`

## Persona Red Flags

**Jordan (First-Timer)**: No 'start here' signal on the offer-grid — four products at equal visual weight with no recommended entry. 'Institutional Grade' eyebrow and 'Tier 01/02/03' naming create immediate intimidation with no 'designed for individuals too' reassurance. Broken CTA buttons mean Apply Now looks like a decorative label — a first-timer may not recognize it as clickable. APY contradiction (5.85% home → 5.15% accounts) reads as bait-and-switch to an uninformed user.

**Casey (Mobile)**: Hero media uses `object-fit: contain` below 900px, creating blank whitespace above and below the 3D glass cube at common phone viewports. Comparison table cells have `white-space: nowrap` — requires horizontal scroll on mobile with no scroll affordance indicator. Feature-list cards stacked vertically with grey circle icons create a long column of grey blob → title → description with no visual relief. Broken CTA blocks show uppercase monospace text at small viewports, taking nearly full width and resembling a form label.

**Riley (Stress Tester)**: APY 5.85% on homepage vs 5.15% on accounts-savings — documents as data trust failure. '£0 Annual Fee' in a USD site — would test VPN UK path, finds no answer on geographic pricing. All five Apply Now / Apply Today / Get The Offer CTAs resolve to /join — five 404s, one per primary CTA. Article page 85vh blank above title — reads as broken page, not loading state, with no skeleton or fallback. `nextjs-widget` block stub on compare.html exposed as an empty unstyled div in EDS runtime.

## Minor Observations

- `main > div { margin: 40px 16px }` in styles.css conflicts with `main > .section { padding: 64px 0 }` — unclassed section wrappers get double-spaced unintentionally
- Footer is sparse (wordmark, legal, four links) with no secondary nav, product links, social handles, or newsletter — below standard for a premium fintech brand where footer is a trust signal
- '/insights/quantum-secure-banking' article is unreachable from primary nav — orphaned content type
- Heading scale does not change at 900px except for xxl (48→72px) — h2 through h6 stay identical at desktop, compressing the typographic depth at 1440px
- Eyebrow pattern defined independently in 7 blocks (no shared token/class) — no single place exists to change the eyebrow style site-wide
- `product-hero` and `stat-panel` are functionally duplicate blocks implementing the identical hero-metric atom
- Header blurs at 20px inline instead of referencing `--glass-blur` (12px) — undeclared inconsistency in the glass system
- `nextjs-widget` block stub on compare.html will render as an empty unstyled div in EDS — should be removed or replaced with native EDS content
