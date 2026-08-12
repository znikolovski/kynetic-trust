/**
 * Block input builder for cta.
 *
 * Row contract (cta.js decorate() reads):
 *   - image row (optional) — <img>/<picture> with no links → background image
 *   - eyebrow (optional)   — short <p> before the heading
 *   - heading              — h2/h3 element
 *   - body (optional)      — paragraph copy
 *   - buttons              — <p> with <strong>/<em> wrapped links
 *   - footnote (optional)  — any row after the button row
 *
 * @param {object} opts
 * @param {string} [opts.image]     — <img> or <picture>, no links
 * @param {string} [opts.eyebrow]
 * @param {string} opts.heading     — full element, e.g. '<h2>...</h2>'
 * @param {string} [opts.body]
 * @param {string} opts.buttons     — full <p> markup
 * @param {string} [opts.footnote]
 * @returns {string[]} array of EDS row HTML strings
 */
export function build({ image, eyebrow, heading, body, buttons, footnote }) {
  const rows = [];
  if (image) rows.push(`<div><div>${image}</div></div>`);
  if (eyebrow) rows.push(`<div><div><p>${eyebrow}</p></div></div>`);
  rows.push(`<div><div>${heading}</div></div>`);
  if (body) rows.push(`<div><div><p>${body}</p></div></div>`);
  rows.push(`<div><div>${buttons}</div></div>`);
  if (footnote) rows.push(`<div><div><p>${footnote}</p></div></div>`);
  return rows;
}
