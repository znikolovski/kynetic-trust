---
target: mortgages
total_score: 17
p0_count: 2
p1_count: 3
timestamp: 2026-07-14T00-44-19Z
slug: localhost-mortgages
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Widget island has no loading indicator; static table and widget coexist with no state signal |
| 2 | Match System / Real World | 2 | "algorithmic underwriting", "financial trajectory", "Calculate Your Momentum" — jargon register mismatches |
| 3 | User Control and Freedom | 2 | View-Rates anchor is a good escape hatch; no product filter, no compare, no breadcrumb |
| 4 | Consistency and Standards | 3 | Design tokens consistently applied; minor H4-inside-H2 heading hierarchy skip |
| 5 | Error Prevention | 1 | Static rate table has no disclaimer or "as of" date; APR not disclosed; comparison-table block misused |
| 6 | Recognition Rather Than Recall | 3 | Product names and CTAs visible; `key_visualizer` icon semantic mismatch on "Close Fast" |
| 7 | Flexibility and Efficiency | 1 | No quick-apply, no personalized rate in hero, no offer-grid filter/sort, no accelerated path for repeat buyers |
| 8 | Aesthetic and Minimalist Design | 3 | Neon Glass is distinctive; calculator section's dual-content (table + widget) is aesthetic noise |
| 9 | Error Recovery | 0 | No error states exist; widget load failure = blank div with no fallback copy or retry |
| 10 | Help and Documentation | 1 | No ARM explanation, no glossary, no "which product is right for me?" — complex financial product, zero decision support |
| **Total** | | **17/40** | **Poor** — significant improvements needed |

---

## Anti-Patterns Verdict

**Does this look AI-generated?**

**LLM assessment**: The Neon Glass design system itself resists the AI-made label — the cyan-aura glass cards, Hanken Grotesk 900 headings, and JetBrains Mono labels form a genuinely distinctive visual identity. The slop is concentrated almost entirely in the content layer:

- *Nautical metaphor with no anchor*: "Sail Into Financial Independence" is semantically disconnected from mortgages — poetic-sounding, brand-story-empty. A creative director kills it in round one.
- *Four-voice tonal whiplash*: "Precision-engineered rates for those who demand more from their capital" (investment-fund voice) → "Accelerated entry into home ownership" (onboarding voice) → "algorithmic underwriting" (engineering blog) → "claim your space" (lifestyle brand). One page, four authors — the classic AI output signature.
- *Template One section cadence*: Hero → Bento Grid → 3-step Process → Calculator → CTA. No section exists for surprise, social proof, or personality.
- *Generic icon-concept pairings*: lock = Fixed-Rate, key = First-Time, diamond = Jumbo Loans. These are the first-pass mappings every LLM produces. Diamond-as-premium is a visual cliché with no connection to the Jumbo product's actual proposition.
- *Copy voice targets wrong persona*: The hero subhead ("Precision-engineered rates for those who demand more from their capital") signals a product for sophisticated investors on a page that also serves first-time homebuyers.

**Deterministic scan**: CLI exit code 2 — 1 confirmed rule hit:

- `overused-font` — `styles/styles.css:52`: `--body-font-family: geist`. Geist has reached saturation threshold. Hanken Grotesk (headings) and JetBrains Mono (labels) were clean.

**Visual overlays**: Screenshot captured at 1440×900. Assessment B confirmed the text-only hero card (empty right column at desktop width), the 2-column offer-grid bento layout, and the comparison table rendering correctly on dark surface.

---

## Overall Impression

The design system is strong and distinctive. The page is let down by content quality, structural bugs, and a critical trust deficit. Two P0 correctness bugs (empty hero visual column, calculator dual-content visibility) mean the page ships broken at desktop. The absence of any trust signals on what is the highest-stakes financial decision most users will ever make is the single biggest conversion barrier. Fix the bugs, add trust signals, and the Neon Glass system will carry the rest.

---

## What's Working

**1. Bento grid sizing creates genuine visual variety**: Large (span 8, row-span 2) + Small (span 4) fill row 1; two Mediums (span 6 each) fill row 2. The 12-column grid math works, the glass hover glow is tasteful and consistent, and the card hierarchy communicates product importance — it just communicates it incorrectly (Fixed-Rate over-emphasized, First-Time Buyers under-emphasized).

**2. Button authoring pattern is elegant and correctly executed**: EDS `**bold**` = primary fill CTA, `*italic*` = secondary ghost. Both render correctly on the mortgages page ("Get The Offer" / "View Rates"). The system bridges content-authoring and visual hierarchy without any block configuration — it is the best DX decision on the site.

**3. Eyebrow + H1 em accent is the strongest brand moment**: "PREMIUM LENDING" eyebrow (JetBrains Mono, uppercase, cyan border, 0.12em tracking) + "Sail Into *Financial Independence*" with the glowing em word is distinctly Kinetic Trust. The glow is subtle enough to be premium, strong enough to be memorable. This treatment should be the template for every hero on the site.

---

## Priority Issues

**[P0] Hero visual column is empty — desktop hero collapses to single-column**
- **Why it matters**: `product-hero.js` guards `if (visual.children.length) inner.append(visual)` — but mortgages.html authors no image row and no stat rows. The 7fr/5fr two-column grid is unused. At 1440px, the right 41% of the hero is blank. Confirmed by screenshot.
- **Fix**: Add 3–4 stat-chip rows to the mortgages hero content (e.g., `From 3.5% Down`, `Rates From X% APR`, `30-Min Decision`, `Licensed in 50 States`) — the `isStatRow()` function in product-hero.js picks up 2-cell rows and renders them as glassmorphic stat chips in the visual column. No image asset required.
- **Suggested command**: `/impeccable layout`

**[P0] Calculator section: static table and widget both visible simultaneously**
- **Why it matters**: The HTML comment says the widget "replaces the table above once mounted" — but no replacement logic exists in any JS, block, or CSS. Both `.comparison-table` and `.nextjs-widget` render at full size at the same time. Users see what looks like duplicated content and an unfinished page.
- **Fix**: In `nextjs-widget.js`, after the widget mounts, call `block.previousElementSibling?.remove()` (or use a `data-widget-fallback` attribute) to remove the static table. Minimum short-term fix: add CSS to the nextjs-widget block that hides its preceding `.comparison-table` sibling when the widget block loads successfully.
- **Suggested command**: `/impeccable harden`

**[P1] No trust signals on the highest-stakes financial product in the portfolio**
- **Why it matters**: A mortgage is typically a 30-year, six-figure commitment. This page has zero trust indicators: no FDIC/NCUA notice, no licensing disclosure, no APR fine-print, no customer testimonials, no security badge, no rate disclaimers. For Jordan (First-Timer) and Riley (Stress Tester), this registers as either an unregulated lender or an incomplete page.
- **Fix**: Add a trust strip component between the hero and the offer-grid: 1-row glass card with FDIC Insured · Licensed Mortgage Lender · 256-bit Encrypted · [X] Homeowners · 4.8★ Reviews. Medium-term: add "Rates shown are representative; actual rates depend on credit score, LTV, and property type. APR calculation required by TILA." at the base of the calculator section.
- **Suggested command**: `/impeccable harden`

**[P1] Accessibility: multiple confirmed failures (focus rings, non-descriptive link text)**
- **Why it matters**: Three separate confirmed findings from the detector:
  - Bare `<a>` links ("Learn more" × 3, "Explore" × 1) have no `:focus-visible` style anywhere in `styles/styles.css`.
  - Secondary button (`.button.secondary:focus-visible`) has a 5% white overlay on near-black — no visible focus ring in practice.
  - `input[type="email"]:focus` in `offer-grid.css` removes the outline with no substitute ring.
  - Three offer card links share the identical visible text "Learn more" with no `aria-label` differentiation — screen reader users hear the same label three times.
- **Fix**: Add `:focus-visible` ring to `a:not(.button)` in `styles.css`. Upgrade secondary button focus to use `box-shadow: 0 0 0 3px var(--color-primary)`. Add `aria-label="Learn more about Fixed-Rate Mortgages"` (etc.) to each card CTA link.
- **Suggested command**: `/impeccable audit`

**[P1] offer-grid section lacks background class — glass cards render on obsidian**
- **Why it matters**: Per AGENTS.md and the design system spec: "Glass cards MUST be placed on a surface (#111318) background to be visible — not on obsidian." The glass background is `rgba(255,255,255,0.03)` — nearly invisible against `#0a0c10`. The offer-grid section wrapper in mortgages.html has no `surface` class.
- **Fix**: Add section metadata with `background: surface` to the Mortgage Options section in `content/mortgages.html`, or add the `surface` class directly to the section wrapper div in the HTML.
- **Suggested command**: `/impeccable layout`

---

## Persona Red Flags

**Jordan (First-Timer)**
- The "First-Time Buyers" card is sized `small` (span-4, top-right corner) — visually the least important product on the page. Jordan's relevant product is sandwiched into a corner next to a massive span-8 Fixed-Rate card.
- "algorithmic underwriting" in the process section. Jordan wonders whether an algorithm will reject them — it reads as cold automation, not reassurance.
- "personalized financial audit" in the CTA. "Audit" triggers IRS-fear associations. Jordan hesitates at the most critical conversion point.
- Hero subhead ("Precision-engineered rates for those who demand more from their capital") signals this site is for sophisticated investors. Jordan doesn't identify as this user and may self-select out.
- Zero educational content: no glossary, no "what is PMI?", no down-payment guidance. Jordan leaves knowing products exist but not which one they qualify for.

**Riley (Stress Tester)**
- Rate table shows 4.25%/4.75%. Current 2025–2026 30yr rates are substantially higher (6.5%+). Riley immediately doubts the site's legitimacy — no "as of" date, no disclaimer that rates change. This is an active trust-destroyer.
- ARM card offers no cap structure (e.g., 5/1 with 2/2/5 caps). Riley wants specifics; a competitor who provides them wins.
- nextjs-widget failure mode = blank div with no loading state and no fallback message. Riley interprets the gap as a broken page.
- No APR disclosure anywhere on the page, which is a TILA requirement in the US for advertised mortgage rates.

**Casey (Distracted Mobile)**
- Bento grid collapses to `span 12` for all cards on mobile — all 4 cards stack full-width with identical sizes. Desktop's visual hierarchy (large = important) vanishes entirely on Casey's phone.
- Comparison-table: 5-column table inside `overflow-x: auto` on mobile. Casey will not horizontally scroll a rate table; she'll scroll past it.
- Calculator section shows both static table and widget simultaneously (P0 bug) — even more confusing on a narrow viewport where the two elements stack visually.
- CTA body copy "Connect with a SecurBank Mortgage Specialist today for a personalized financial audit…" is 17 words. Casey reads only "Get Started Now" — but the word "audit" above it is the last thing she processes before tapping.

---

## Minor Observations

1. `key_visualizer` (Material Symbol, a data-viz/charts icon) is used for "Close Fast" in the feature-list. The label "Close Fast" refers to mortgage closing, not data visualization. Should use `vpn_key` or `lock_open`.
2. `--color-secondary` (violet `#dfb7ff`) is completely absent from this page. The Jumbo Loans card (premium segment) is an obvious candidate for violet accent treatment to differentiate it from the cyan-dominant grid.
3. All section H2 headings ("Mortgage Options", "Simple Process", "Calculate Your Momentum") render identically at 40px Hanken 800. No typographic variation between sections signals importance levels. Everything after the hero is the same visual weight.
4. `scroll-margin` for the `id="mortgage-options"` anchor target: the target is on the section div, not an H-element. Heading `scroll-margin: 96px` won't apply. The "View Rates" smooth-scroll may land partially under the fixed nav.
5. `text-wrap: balance` is absent from all headings. Confirmed by Assessment B. Long titles at fluid widths risk awkward single-word orphans.
6. Missing `@media (prefers-reduced-motion: reduce)` counterparts for all transitions. Found in `styles/styles.css:240`, `offer-grid.css:14`, `feature-list.css:45`. None animate layout properties (only composited + color), but the guard is still required.
7. Heading hierarchy skip: H2 "Simple Process" → H4 elements inside feature-list items (no H3). Screen-reader and accessibility-audit flag.

---

## Questions to Consider

1. **What if the offer-grid was a 2-question selector before the gallery?** "Buying or refinancing?" + "First home or investment property?" reduces 4 simultaneous choices to 1–2 pre-filtered relevant cards. The current approach asks Jordan to self-identify across 4 mortgage types. How much of the expected bounce rate is users who couldn't figure out which card applied to them?

2. **Should the hero's right column show live rates instead of an image?** Competitors (Rocket Mortgage, Better.com) lead with real-time rate estimates above the fold. A glassmorphic rate-ticker showing "Today: 30yr Fixed 6.75% · 15yr Fixed 6.12% · 5/1 ARM 5.89% · As of [today]" would simultaneously fix the empty visual column, give Riley immediate rate transparency, and give Jordan a concrete number — three problems solved with one content decision.

3. **Does "Sail Into Financial Independence" earn its nautical metaphor?** Test against a specific outcome headline: "Own Your Home for Less Than You Think" or "Rates That Move With You." For Casey on mobile who reads only the headline before deciding whether to scroll, which version converts better — the poetic one or the concrete one?
