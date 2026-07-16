# Component Structure Contracts

Canonical DOM blueprints for every class defined in `components.css`. Both EDS blocks and Next.js components must produce this exact structure. Add new components here before implementing them in either project.

---

## glass-card

Surface material for card-level containers. Radius is context-dependent: blocks override `border-radius` on the element itself. The base (8px) is correct for dashboard panels; marketing cards use 24px.

```html
<div class="glass-card">
  <!-- card content -->
</div>
```

**Radius overrides:**
- Marketing bento cards: add `border-radius: var(--radius-xl)` on `.offer-card` (done in `offer-grid.css`)
- Feature-list cards: same, on `.feature-list-item` (done in `feature-list.css`)
- Dashboard metric panels: use default `--radius-lg`

**Interaction:** Hover fires `border-color` brightening and `--cyan-aura` glow automatically via `components.css`. Blocks that need a persistent glow (featured cards) set those properties at rest with higher specificity — they win because hover is (0,2,0) specificity and block modifiers are (0,3,0).

**ARIA:** No additional roles. Heading level inside the card must respect page outline hierarchy.

---

## eyebrow

Category pill label. Always JetBrains Mono, uppercase, pill radius. Optional icon precedes the text.

```html
<!-- Text-only -->
<div class="eyebrow">UNLIMITED 5%</div>

<!-- With Material Symbol icon -->
<div class="eyebrow">
  <span class="material-symbol" aria-hidden="true">payments</span>
  UNLIMITED 5%
</div>

<!-- Violet modifier (Stability / Foundation theme) -->
<div class="eyebrow eyebrow--violet">BUILD A FOUNDATION</div>
```

**ARIA:** Icon span must be `aria-hidden="true"`. The label text provides the accessible name.

---

## material-symbol

Material Symbols Outlined icon. Used inline within eyebrows, feature-list icons, and card watermarks.

```html
<span class="material-symbol" aria-hidden="true">payments</span>
```

Size and color are set by the parent component context. `components.css` sets only the base font and rendering settings.

---

## badge

Status or type pill. BEM modifiers set the color role. The full set of modifiers is closed — do not add new ones without updating this file and `components.css` simultaneously.

```html
<!-- Status badges -->
<span class="badge badge--completed">COMPLETED</span>
<span class="badge badge--settled">SETTLED</span>
<span class="badge badge--pending">PENDING</span>

<!-- Transaction type badges -->
<span class="badge badge--trade">TRADE</span>
<span class="badge badge--transfer">TRANSFER</span>
<span class="badge badge--yield">YIELD</span>
```

**Color vocabulary (closed set):**
| Modifier | Color | Meaning |
|----------|-------|---------|
| `--completed` | `#00ff80` green | Terminal success state |
| `--settled` | `#00dbe9` cyan | Confirmed institutional clearing |
| `--pending` | `#ebffa9` lime | Awaiting action |
| `--trade` | `#ebffa9` lime | Trade transaction type |
| `--transfer` | muted | Transfer transaction type |
| `--yield` | `#dfb7ff` violet | Yield/interest transaction type |

**ARIA:** Badges are presentational labels alongside other data. If the badge is the only indicator of state, add `aria-label` or wrap in a visually-hidden complementary text element.

---

## stat-label / stat-value

Metric display pair. Always used together. Label above, value below.

```html
<div>
  <span class="stat-label">Variable APR</span>
  <span class="stat-value">9.99%</span>
</div>
```

**Typography:** `stat-label` is JetBrains Mono 11px uppercase. `stat-value` is Hanken Grotesk 900 at `--heading-font-size-m` (24px), primary cyan. Both are block-level (`display: block`).

**Do not** use `stat-value` for non-numeric content. If the value is a string label (e.g., "Active"), use plain body text instead.

---

## Adding new components

1. Define the class and all modifiers in `design/components.css`
2. Document the DOM blueprint here with ARIA notes
3. Implement in the relevant project — EDS block JS produces the contract; React component renders it
4. Update `design/DESIGN.md` Components section and `.impeccable/design.json` components array
5. PR must include all four changes simultaneously — contract before implementation
