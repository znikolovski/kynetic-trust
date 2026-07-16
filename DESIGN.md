---
name: Kinetic Trust / Neon Glass
description: Banking at the speed and precision of the markets it serves
colors:
  obsidian: "#0a0c10"
  surface: "#111318"
  surface-lowest: "#0c0e12"
  primary: "#00dbe9"
  primary-container: "#00f0ff"
  secondary: "#dfb7ff"
  secondary-container: "#b97cf4"
  tertiary: "#ebffa9"
  error: "#ffb4ab"
  on-surface: "#e2e2e8"
  on-surface-variant: "#b9cacb"
  outline: "#849495"
  outline-variant: "#3b494b"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'adobe-clean', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
  badge:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    letterSpacing: "0.1em"
  icon:
    fontFamily: "'Material Symbols Outlined'"
    fontSize: "20px"
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24"
rounded:
  default: "4px"
  lg: "8px"
  xl: "24px"
  full: "9999px"
spacing:
  gutter: "24px"
  section-v: "80px"
  card-pad: "32px"
  card-pad-lg: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.primary-container}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  glass-card:
    backgroundColor: "rgba(255,255,255,0.03)"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-pad}"
  eyebrow-pill:
    backgroundColor: "rgba(0,219,233,0.08)"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "4px 14px"
---

# Design System: Kinetic Trust / Neon Glass

## 1. Overview

**Creative North Star: "The Neon Vault"**

The Kinetic Trust design system is a vault — not a bank branch. The obsidian surface is the vault door: absolute, impenetrable, radiating gravity. The primary cyan is the signal that something is alive inside: phosphor light cutting through total darkness, carrying live data and actionable intelligence. Glass panels don't decorate — they reveal depth without breaching the vault's integrity. Every component is a control surface, not a display case.

This system explicitly rejects the serifed restraint of traditional private banking (Coutts, J.P. Morgan Private Bank), which reads as slow and exclusionary. It rejects the grey-grid density of Bloomberg terminals — functional but not aspirational, institutional without intention. It rejects the candy-bright roundedness of neobank/fintech-lite products (Monzo, Revolut) — too retail, too thin, zero institutional gravity. Kinetic Trust is the alternative: the first bank built for people whose money is always working, expressed through structural precision and live energy rather than through claim.

The design is a complete register: the "Neon Glass" vocabulary — obsidian depth, glass-surface cards, primary cyan as the single electric signal — must remain coherent from the logged-out marketing site through to the authenticated dashboard. A visitor moving from the credit-cards page to their portfolio view must feel the same vault.

**Key Characteristics:**
- Obsidian depth, never flat: three distinct background layers create visual gravity without pattern or illustration
- One signal, maximum rarity: primary cyan appears on ≤10% of any screen surface
- Glass as structure: glassmorphism is the layout primitive, used purposefully for cards and overlays only — never decorative
- Hanken Grotesk at 900 weight: display text is Kinetic Trust's loudest brand assertion
- JetBrains Mono for all numeric and machine-generated strings: data is institutionally precise

## 2. Colors: The Vault Palette

Three depth layers anchored in near-black, animated by a single phosphor cyan accent. Violet and lime appear as tertiary signals; never simultaneously with the primary as a focal accent.

### Primary
- **Phosphor Cyan** (`#00dbe9`): The electric signal. Used on interactive elements — button fills, links, active states, eyebrow icon color, hover borders, chart series. Its rarity is the point. Never used as a background surface.
- **Phosphor Cyan Bright** (`#00f0ff`): The live state of Phosphor Cyan. Hover fill, focus rings, glow source. Used to indicate state change, not to add variety.

### Secondary
- **Sovereign Violet** (`#dfb7ff`): The secondary accent. Reserved for the "Build a Foundation" savings and stability theme and select structural product cards. Never appears on the same surface as Phosphor Cyan at full saturation.
- **Violet Mid** (`#b97cf4`): Hover and active state of Sovereign Violet; used in `offer-card-violet` backgrounds and secondary interactive states.

### Tertiary
- **Kinetic Lime** (`#ebffa9`): High-visibility accent for confirmation states, institutional rate/return copy, or deliberate attention signals. Use in isolation; never adjacent to Sovereign Violet.

### Neutral
- **Obsidian** (`#0a0c10`): The vault floor. Default body background and base layer of the depth system.
- **Surface** (`#111318`): The primary card and section background layer. Glass cards must sit on Surface, not Obsidian — the contrast registers the glass effect.
- **Surface Lowest** (`#0c0e12`): The deepest recessed layer. Used for sidebar backgrounds, input fields, and below-fold content.
- **On-Surface** (`#e2e2e8`): Primary text. High contrast against all three depth layers.
- **On-Surface Variant** (`#b9cacb`): Secondary and supporting text. Metadata, captions, table secondary columns.
- **Outline** (`#849495`): Interactive borders and dividers at rest.
- **Outline Variant** (`#3b494b`): Subtle structural borders; card borders at rest (before hover brightens them to `rgb(0 219 233 / 35%)`).

### Named Rules

**The One Signal Rule.** Primary cyan (`#00dbe9`) covers ≤10% of any given screen surface. If more than one in ten visual units is cyan, the signal is diluted. Rarity is the product.

**The Vault First Rule.** Glass cards must be placed on a Surface (`#111318`) or Surface Lowest (`#0c0e12`) background layer to register visually. A glass card on Obsidian is invisible. This is not a creative choice — it is a rendering requirement.

## 3. Typography: Institutional Voice

**Display Font:** Hanken Grotesk (700–900 weight, system-ui fallback)
**Body Font:** Adobe Clean (400–600 weight, system-ui fallback)
**Label/Data Font:** JetBrains Mono (500–600 weight, monospace fallback)

**Character:** Hanken Grotesk at 900 weight is the brand's loudest assertion — angular, heavy, unapologetically institutional. It does not whisper confidence; it radiates it. Adobe Clean provides the reading register: Adobe's own institutional typeface, measured and precise — inheriting the discipline of the product suite it belongs to without the coldness of pure system fonts. JetBrains Mono handles all numeric and machine-generated strings, establishing the data layer as a separate vocabulary from editorial copy.

### Hierarchy
- **Display** (900 weight, `clamp(2.5rem, 6vw, 5.5rem)`, line-height 1, letter-spacing -0.02em): Hero headings only — one per page or campaign hero. Never repeated within a section. `text-wrap: balance` required.
- **Headline** (800 weight, `clamp(1.75rem, 3.5vw, 3rem)`, line-height 1.1, letter-spacing -0.02em): Section headings, card primary titles on large/tall cards. `text-wrap: balance` required.
- **Title** (700 weight, `clamp(1.25rem, 2vw, 1.75rem)`, line-height 1.2, letter-spacing -0.01em): Card headings on medium/small cards, modal titles, secondary section headings.
- **Body** (400 weight, `1.125rem`, line-height 1.6): All prose content. Maximum line length 65ch. Geist exclusively.
- **Label** (500 weight, `0.75rem`, letter-spacing 0.1em, uppercase): Eyebrow labels, stat captions, data point annotations, button text. JetBrains Mono exclusively.

### Named Rules

**The Data Mono Rule.** JetBrains Mono is reserved for three uses only: numeric values (rates, balances, dates), machine-generated strings (codes, IDs), and eyebrow labels above card headings. Every other typographic role belongs to Hanken Grotesk or Geist. Mixing monospace into prose is prohibited.

**The Weight Rule.** `h1`–`h2` in editorial contexts: 900 weight. `h2`–`h3` in card contexts: 800 weight. `h3`–`h4` in list or table contexts: 700 weight. Body always 400. Never use 600 for headings — it reads as "almost bold" rather than "intentionally controlled."

## 4. Elevation

This system expresses depth through tonal layering, not drop shadows. Three background surfaces create the vertical stack: Obsidian (0) → Surface (1) → Surface Lowest (recessed). Glass cards float above the Surface layer using the glassmorphism formula: `background: rgba(255,255,255,0.03)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.1)`. This is material elevation, not shadow elevation.

The one exception is the Cyan Aura: `box-shadow: 0 0 24px -4px rgb(0 219 233 / 30%)`. This appears exclusively on hover states to signal interactivity, never at rest. It functions as a glow, not a shadow — the distinction matters visually and semantically.

### Shadow Vocabulary
- **Cyan Aura** (`box-shadow: 0 0 24px -4px rgba(0, 219, 233, 0.3)`): Applied to glass cards and primary buttons on hover only. Communicates that the element is a live, interactive control surface. Never applied at rest.

### Named Rules

**The Flat-By-Default Rule.** All surfaces are flat and shadow-free at rest. The only elevation signal is the tonal stack (background color depth). Shadows appear exclusively as hover-state interactivity signals, never as decoration or hierarchy indicators.

## 5. Components

### Buttons

Buttons are the sharpest typographic element in the system — tight, precise, weighted.

- **Shape:** Soft rectangular (8px radius / `--radius-lg`). Pill shape (`--radius-full`) is reserved for eyebrow pills only — never on buttons.
- **Primary:** Phosphor Cyan fill (`#00dbe9`) + Obsidian text (`#0a0c10`), `10px 24px` padding, JetBrains Mono label, uppercase, 600 weight.
- **Hover / Focus:** Fill shifts to Phosphor Cyan Bright (`#00f0ff`); Cyan Aura glow applied. Focus ring: `2px solid #00dbe9`, 3px offset.
- **Ghost / Secondary:** Transparent background, `1px solid rgba(255,255,255,0.1)` border, cyan text. Hover: border brightens to `rgba(0,219,233,0.4)`.
- **Accent (italic link):** `<em>` wrapper treatment. No border, no background. Cyan text, underline on hover. Used for secondary CTAs within card actions.
- **Transition:** `background 0.2s ease, box-shadow 0.3s ease, border-color 0.3s ease`. `@media (prefers-reduced-motion: reduce)`: `transition: none`.

### Eyebrow Pills

Eyebrow pills identify card or section categories using a short uppercase label in JetBrains Mono.

- **Style:** `background: rgba(0,219,233,0.08)`, `border: 1px solid rgba(0,219,233,0.15)`, `border-radius: 9999px`, `padding: 4px 14px`.
- **Text:** JetBrains Mono, 0.75rem, 0.1em letter-spacing, uppercase, Phosphor Cyan (`#00dbe9`).
- **Icon:** Optional Material Symbol at 28px preceding the label text; same cyan color.
- **Violet variant** (Stability/Foundation cards): `background: rgba(223,183,255,0.05)`, border and text in Sovereign Violet (`#dfb7ff`).

### Cards / Glass Cards

The glass card is the primary layout container for the entire offer system.

- **Corner Style:** `border-radius: 1.5rem` (24px / `--radius-xl`). Never less on a card.
- **Background:** `rgba(255,255,255,0.03)` with `backdrop-filter: blur(12px)`.
- **Border:** `1px solid rgba(255,255,255,0.1)` at rest; transitions to `1px solid rgba(0,219,233,0.35)` on hover.
- **Shadow:** None at rest. Cyan Aura on hover.
- **Internal Padding:** 32px (`--card-pad`) for standard cards; 40px (`--card-pad-lg`) for large/tall variants.
- **Background image overlay:** When a bg image is authored, a `rgb(10 12 16 / 88%)` overlay via `::before` pseudo-element keeps text legible.
- **Ghost watermark:** For cards with a Material Symbol icon and no bg image, the icon renders at 220px, 4% opacity via `::after`, bottom-right aligned. Suppressed when a bg image is present.

### Offer Grid

A 12-column bento grid. Card sizes: `large` (span 8, 2 rows), `tall` (span 8, 1 row), `medium` (span 6), `small` (span 4), `wide` (span 12). The `.four-col` modifier on `.offer-grid` forces small cards to `span 3`, placing exactly 4 per row in the 12-column system. Standard small cards are 3 per row at `span 4`.

### Inputs / Fields

- **Style:** No box border. `border-bottom: 1px solid rgba(255,255,255,0.15)` only. Transparent background.
- **Focus:** `border-bottom-color: #00dbe9`; `outline: 2px solid #00dbe9`, 3px offset.
- **Text:** On-Surface (`#e2e2e8`), 1.125rem, Geist.

### Navigation

Fixed top, full-width, `backdrop-filter: blur(12px)` on scroll. Background: Surface Lowest at 90% opacity. Nav links: On-Surface Variant at rest; Phosphor Cyan on active/hover. Logo: Hanken Grotesk 900.

### CTA Section

Full-width conversion surface. `prominent` variant: full-bleed, background image with dark overlay. `centered` modifier: auto-widths the CTA button and centers all content. Eyebrow pills render from short `<p>` tags only when they precede the heading in authored content — content order is the rendering gate.

## 6. Do's and Don'ts

### Do:
- **Do** place glass cards on a Surface (`#111318`) background, never directly on Obsidian (`#0a0c10`). The contrast makes the glass effect register.
- **Do** use JetBrains Mono exclusively for numeric values, machine-generated strings, and eyebrow labels. Never use it for headings or body prose.
- **Do** use `border-radius: 8px` (`--radius-lg`) on buttons and `border-radius: 24px` (`--radius-xl`) on cards. These two values are the system's complete shape vocabulary.
- **Do** apply the Cyan Aura (`box-shadow: 0 0 24px -4px rgba(0,219,233,0.3)`) only on interactive hover states — cards and primary buttons.
- **Do** use Hanken Grotesk at 900 weight for display headings. Below 800 reads as editorial hesitation, not institutional confidence.
- **Do** include `@media (prefers-reduced-motion: reduce)` alternatives for all transitions and animations. Target WCAG 2.1 AAA.
- **Do** use the `four-col` modifier class on `offer-grid` when rendering exactly 4 small cards in a row — standard `span 4` gives 3 per row in a 12-column grid, not 4.
- **Do** reorder authored content so eyebrow badge `<p>` tags precede the `<h2>` in CTA blocks — the JS gates pill rendering on content order.

### Don't:
- **Don't** build or reference the traditional private banking aesthetic (Coutts, J.P. Morgan Private Bank): no serif display fonts, no dark-wood warmth, no old-money discretion. SecurBank is earned performance, not inherited wealth.
- **Don't** use the Bloomberg / Reuters terminal register: no grey-grid density, no monochrome layouts, no information-first-with-zero-visual-intention execution.
- **Don't** build neobank / fintech-lite components: no candy-bright pastels, no rounded-everything cards, no playful microcopy. Minimum contrast for the institutional user must be ≥7:1 (WCAG 2.1 AAA).
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards or list items. Replace with tinted background + full-border treatment consistent with the glass card vocabulary.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use a single solid Phosphor Cyan (`#00dbe9`) for emphasis.
- **Don't** add glassmorphism decoratively. Any blur layer that doesn't carry a card's informational weight is noise.
- **Don't** apply eyebrow pills above every section. One named kicker as a deliberate brand signal is voice; an eyebrow on every heading is AI grammar.
- **Don't** place identical-sized cards in a repeating icon + heading + text grid. The bento system's size variants (large/tall/medium/small/wide) exist to prevent this pattern.
- **Don't** use the hero-metric template (big number, small label, gradient orb). SecurBank displays rates and values as typographic elements with JetBrains Mono data labels — not SaaS dashboard cards.
