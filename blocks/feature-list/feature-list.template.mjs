/**
 * Block input builder for feature-list.
 *
 * Row contract (feature-list.js decorate() reads):
 *   cell 1 — icon: Material Symbol name, SVG ref, or <picture>
 *   cell 2 — heading text
 *   cell 3 — body text or HTML
 *   cell 4 — optional modifier class (e.g. 'primary', 'secondary')
 *
 * @param {object} opts
 * @param {Array<{icon:string, heading:string, body:string, modifier?:string}>} opts.items
 * @returns {string[]} array of EDS row HTML strings
 */
export function build({ items = [] }) {
  return items.map(({ icon, heading, body, modifier }) => {
    const cells = [icon ?? '', heading ?? '', body ?? ''];
    if (modifier !== undefined) cells.push(modifier);
    return `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  });
}
