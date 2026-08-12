/**
 * Block input builder for product-hero.
 *
 * Encodes the row contract that product-hero.js decorate() reads:
 *   1. eyebrow    — short text (<60 chars, no links) → eyebrow pill
 *   2. heading    — h1/h2 element
 *   3. body       — paragraph copy
 *   4. buttons    — <p> with <strong>/<em> wrapped links
 *   5. image      — <img> or <picture> → visual column
 *   6+ stats      — 2-cell rows [label, value] → dashboard tiles
 *                   3-cell rows [label, value, sub] → featured stat chip
 *
 * @param {object} opts
 * @param {string} [opts.eyebrow]
 * @param {string} opts.heading        — full element, e.g. '<h1>...</h1>'
 * @param {string} [opts.body]
 * @param {string} [opts.buttons]      — full <p> markup
 * @param {string} [opts.image]        — <img> or <picture>
 * @param {Array<{label:string, value:string, sub?:string}>} [opts.stats]
 * @returns {string[]} array of EDS row HTML strings
 */
export function build({ eyebrow, heading, body, buttons, image, stats = [] }) {
  const rows = [];
  if (eyebrow) rows.push(`<div><div><p>${eyebrow}</p></div></div>`);
  rows.push(`<div><div>${heading}</div></div>`);
  if (body) rows.push(`<div><div><p>${body}</p></div></div>`);
  if (buttons) rows.push(`<div><div>${buttons}</div></div>`);
  if (image) rows.push(`<div><div>${image}</div></div>`);
  for (const { label, value, sub } of stats) {
    const cells = [label, value, ...(sub !== undefined ? [sub] : [])];
    rows.push(`<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`);
  }
  return rows;
}
