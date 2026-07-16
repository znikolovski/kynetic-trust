---
target: register
total_score: 17
p0_count: 2
p1_count: 3
timestamp: 2026-07-14T01-03-59Z
slug: localhost-register
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Progress indicator present; "75% COMPLETE" is hardcoded static text; no submission loading state |
| 2 | Match System / Real World | 1 | "Identity Creation", "Master Password", "Kinetic Trust Protocols", "integrated into ecosystem", "AES-512 Quantum" — banking jargon replaced with invented sci-fi vocabulary |
| 3 | User Control and Freedom | 2 | Back buttons present; no "save progress" or "sign in instead" path; single-click step-1 advance with no undo |
| 4 | Consistency and Standards | 2 | Step 2 named "Identity Creation" in heading, "Account Details" in progress indicator; widget button radius departs from global design system |
| 5 | Error Prevention | 2 | Password strength checklist is correct error prevention; email validation is `includes('@')` only; SSN has no format validation; no age check |
| 6 | Recognition Rather Than Recall | 2 | Account type selected in step 1 is not shown in steps 2–4; no review of entered data before completion |
| 7 | Flexibility and Efficiency | 1 | `autocomplete` attributes correct; no Enter-key submit; no social login; no "already have an account" path; no accelerated path for returning users |
| 8 | Aesthetic and Minimalist Design | 3 | Neon Glass executes well; step 2's 7-field density and success screen's fake status cards are the two violations |
| 9 | Error Recovery | 2 | Inline errors present but 6 of 9 field error `<p>` elements lack `role="alert"` — screen readers miss them; on-submit-only (no live validation) |
| 10 | Help and Documentation | 0 | No contextual help for any field; no SSN explanation; no FDIC/regulatory info; no live support link |
| **Total** | | **17/40** | **Poor** — significant improvements needed |

---

## Anti-Patterns Verdict

**Does this look AI-generated?**

**LLM assessment**: The Neon Glass design system delivers genuine personality (per-card accent colors, glassmorphic step transitions, JetBrains Mono labels). The slop signature is entirely in the copy and naming layer:

- *Invented vocabulary masking real functions*: "Identity Creation" is a form step, "Master Password" is a login password, "Kinetic Trust Protocols" is a Terms of Service. Obfuscating legal document names in a financial consent flow is an active harm, not just a style issue.
- *Robotic success voice*: "You have successfully integrated into the SecurBank ecosystem" is an OS log entry placed at the highest-stakes emotional moment in the onboarding — the first second of being a customer. The Neon Glass system has personality; the copy doesn't inhabit it.
- *Fabricated technical claim*: "AES-512 Quantum" on the success screen. AES-512 does not exist. This is an LLM producing a plausible-sounding cipher that is factually false — on a financial product's registration screen, a material credibility failure.
- *Unicode Block Elements as product icons*: ⬡ ◈ ⬒ (hexagon, square-with-dot, half-filled square) are geometric shapes that communicate nothing about "account," "credit," or "home." They look technical; they mean nothing.

**Deterministic scan**: CLI exit code 2, 1 confirmed rule:
- `overused-font` — `styles/styles.css:52`: Geist body font. Hanken Grotesk (headings) and JetBrains Mono (labels) are clean.

Additional confirmed from manual scan of RegistrationFlow.tsx:
- `numbered-step-markers` — `RegistrationFlow.tsx:225`: "STEP 01 OF 04 — CHOOSE YOUR PATH" — the zero-padded ordinal anti-pattern. Confirmed by dashboard screenshot.
- `missing-reduced-motion` — 6 locations: progress bar `transition: 'transform 0.5s'`, StepDot `transition: 'all 0.3s'`, card hover `transform: translateY(-4px)` in injected `<style>`, account card `transition: 'all 0.3s'`, 2FA button `transition: 'all 0.2s'`, Continue button `transition: 'all 0.2s'`. None guarded.
- `unscoped-global-styles` — `RegistrationFlow.tsx:207–213`: raw `<style>` block with global-namespace class selectors (`.sb-reg-card`, `.sb-reg-input`, etc.) emitted in JSX render, duplicating on every mount.

**Visual overlays**: Screenshots captured. `localhost:3000/register` — static offer-grid renders correctly. `localhost:3001/register` — widget step 1 renders with per-card accent colors and step indicator. "STEP 01 OF 04" caption confirmed visible.

---

## Overall Impression

The registration flow has the best single interaction on the entire site — the password strength checklist — and the worst copy moment — the "AES-512 Quantum" fabrication on the success screen. The Neon Glass system is beautifully applied to the per-card accent differentiation and glassmorphic transitions. But the flow asks users to hand over their SSN before establishing a password, contains a fabricated cipher claim that will destroy credibility with informed users, skips a review step before account finalization, and ends with voice so cold a new customer feels like a CRM entry, not a person who just made a major financial decision.

---

## What's Working

1. **Password strength checklist is the best interaction in the flow**: Live `RuleCheck` with ✓/○ states, per-rule color feedback, and Continue disabled until all rules pass converts the anxiety of "what counts as valid?" into a satisfying gamified checklist. Correct error-prevention approach — disable before submit, not error after.
2. **Per-card accent color differentiation (step 1 widget)**: Cyan / violet / lime-green across account type cards is a purposeful use of the full 3-accent palette. The selected-state glow carries interaction feedback within the design language, not against it.
3. **Progress indicator motion and focus management**: `scaleX` progress bar avoids layout thrash. `StepDot` with `aria-current="step"` and `headingRef.current?.focus()` on step change are non-trivial accessibility decisions that are quietly correct (with one wiring bug noted below).

---

## Priority Issues

**[P0] "AES-512 Quantum" is a fabricated cryptographic claim**
- **Why it matters**: AES is defined at 128/192/256-bit key lengths only. AES-512 does not exist. This appears verbatim on the success screen of a financial product registration. Technically literate users (who are disproportionately represented among challenger-bank early adopters) will immediately recognize the fabrication and lose trust in the institution's technical claims. In a regulated financial context, false statements about encryption may also constitute a material misrepresentation.
- **Fix**: Replace with "AES-256 Encryption" and remove "Quantum" entirely. RegistrationFlow.tsx line 506.
- **Suggested command**: `/impeccable clarify`

**[P0] No review step before account is finalized**
- **Why it matters**: The wizard advances from security setup directly to a success screen. The user never sees a summary of: their selected account type, entered name/email (even masked), 2FA method, or the terms they consented to. Financial account registration requires clear user confirmation before finalization. The account creation trigger is an invisible moment with no user agency.
- **Fix**: Insert a "Review & Confirm" step between step 3 (security) and step 4 (success). Show: account type badge (with accent color), masked name/email, 2FA method, terms link, and a single "Create Account" CTA. Move current success screen to step 5. Update the 4-step counter to 5 or restructure current steps.
- **Suggested command**: `/impeccable shape`

**[P1] Accessibility cluster — 5 confirmed failures in RegistrationFlow.tsx**
- (a) 6 field error `<p>` elements (firstName, lastName, email, mobile, dob, ssn) lack `role="alert"` — invisible to screen readers. Only consent and password errors are correctly marked.
- (b) Progress bar `<div>` lacks `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- (c) 2FA choice group: `<p>` heading label not associated with toggle buttons — no `role="group"` + `aria-labelledby` or `<fieldset>`/`<legend>`.
- (d) Step 4 `headingRef` fires on brand `<div>`, not `<h1>` — screen reader announces "SecurBank" not the page heading. Also a TypeScript type mismatch (HTMLHeadingElement ref on a div).
- (e) No `<form>` element wrapping any step — no form landmark, Enter key does not submit.
- **Fix**: Add `role="alert"` to all 6 field error elements. Add `role="progressbar"` + ARIA values to progress bar. Add `role="group"` + `aria-labelledby` to 2FA section. Fix headingRef to reference the `<h1>`. Wrap each step's interactive fields in a `<form onSubmit={handleContinue}>`.
- **Suggested command**: `/impeccable audit`

**[P1] SSN collected before security credentials are established**
- **Why it matters**: Step 2 collects SSN/TIN before the user has created any authentication credentials in step 3. Standard trust sequencing: contact info → authentication → identity verification. The user transmits their most sensitive identifier while unauthenticated. This creates a trust perception problem even if the backend eventually handles it correctly.
- **Fix**: Restructure step sequence: (1) account type → (2) contact info (name, email, phone) → (3) security setup (password + 2FA) → (4) identity verification (DOB + SSN, with inline copy: "Required by federal KYC regulation — encrypted in transit and at rest") → (5) review → (6) success.
- **Suggested command**: `/impeccable shape`

**[P1] No trust signals at entry — static page and widget step 1 both empty**
- **Why it matters**: Both the static fallback and the mounted widget ask users to commit to opening a bank account with zero trust signals. No FDIC indication, no security statement, no "already 10,000 customers" social proof, no "no credit check for Personal Account" disclosure, no time-estimate for any flow. The page is asking for SSN without establishing credibility.
- **Fix**: Add a one-line trust bar to `register.html` below the H1: authored as a paragraph of Mono text "FDIC INSURED · ZERO FEES · 256-BIT ENCRYPTED." No new block needed — styles.css mono treatment applies to `.metadata p`. In the widget, add a compact trust footnote below the card grid in step 1.
- **Suggested command**: `/impeccable harden`

---

## Persona Red Flags

**Jordan (First-Timer)**: Arrives with no brand awareness. Page body has no brand anchor beyond nav. "Every journey begins with a single, secure choice" is motivational padding — contains zero product information. Clicks Personal Account immediately (single-click advance — no confirmation). Step 2: 7 fields including SSN. "Identity Creation" heading doesn't tell Jordan this is a personal info form. "Kinetic Trust Protocols" consent link — Jordan doesn't recognize this as a Terms of Service and may not understand they're consenting to legal terms. Jordan's "Verified" status on the success screen gives no account number, no next-step clarity, no "check your email." Jordan is confused about whether the account was actually opened. High abandonment risk at step 2; high confusion risk at step 4.

**Sam (Screen Reader User)**: `headingRef` fires on the brand `<div>`, not the `<h1>` — on step change, Sam hears "SecurBank" announced, not the step heading. 6 field errors (first/last name, email, mobile, DOB, SSN) render as plain `<p>` — Sam fills all 7 fields, hits Continue, and hears nothing when 4 validation errors fire. Progress bar is decorative — no `role="progressbar"` or `aria-value*` attributes. 2FA toggle buttons have no association to their group label. No `<form>` element means no form landmark — Sam cannot use "next form" shortcut in screen reader browse mode.

**Casey (Distracted Mobile)**: The 7-field step 2 requires significant mobile scrolling. DOB `type="date"` triggers native pickers — iOS renders a wheel picker that is slow and error-prone for typing a known birth year. Casey gets interrupted mid-step-2, returns later, and finds the form cleared with no session persistence. The single-click card advance in step 1 means a mis-tap immediately commits Casey to a product she didn't intend. Continue button at the bottom of a 7-field scrolled form may be off-screen after the keyboard closes.

---

## Minor Observations

1. Emoji password-visibility toggles (👁/🙈) — the `visibility` / `visibility_off` Material Symbols icons are already loaded and would be on-brand. This was flagged in the fidelity review as L1 but is unresolved.
2. Step 2 heading is "Identity Creation." Progress indicator calls the same step "Account Details." Two different names for the same step, visible simultaneously.
3. "75% COMPLETE" progress label is hardcoded static text (line ~step 3 header). A dynamic `${Math.round(((step - 1) / 3) * 100)}%` is already computable from the `step` state and would cost 0 additional complexity.
4. `window.location.href = '/accounts'` hard navigation at step 4 bypasses React routing. If `onComplete` prop is also provided by the parent, double navigation may occur.
5. Static fallback links to `/register/personal`, `/register/credit-card`, `/register/mortgage` — three deep-link routes that need independent implementations for the no-JS path to be functional.
6. `border-radius: 0.125rem` on widget form inputs/buttons departs from global `--radius-full` pill buttons — a visible design system inconsistency when the widget is embedded in EDS page context.
7. `maxWidth: 320` on the progress indicator container is a magic number without a design token. All other widths in the component use design tokens or percentage values.
8. The success screen's "Active Sync" status card describes real-time data sync. The dashboard at `/accounts` has not established any real-time data connection. This claim is aspirational fiction, not a real system status.

---

## Questions to Consider

1. **What actually happens when a user clicks "Mortgage App"?** The wizard routes them through the same 7-field step 2 as Personal Account with no acknowledgment that a mortgage application is weeks-long and requires income documentation, a hard credit inquiry, and specialist review. Is a 4-step React wizard the right container for a mortgage application at all — or should that path branch to a dedicated, high-touch journey with a real time-expectation?

2. **Why does the success screen look like a system status dashboard instead of a human welcome?** "Verified / AES-512 Quantum / Active Sync" is designed to signal technical competence. But it positions the user as a system node, not a person who made a financial decision. If you had to leave the user with one emotion at the end of this flow — what would it be? Does this screen deliver it?

3. **The page is titled "SecurBank | Join" but the body promises "financial freedom" — where on this page does the user encounter a specific reason to trust this institution with their SSN?** Not aesthetic vibes — a concrete, credible trust signal. FDIC insurance? Licensed lender status? A customer testimonial? A regulatory disclosure? None exist. The aesthetic says premium; the page says nothing about why it should be trusted.
