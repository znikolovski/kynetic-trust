/**
 * Large glassmorphic hero used on product pages (Credit Cards, Accounts &
 * Savings). Rows, all optional except heading:
 *   1. eyebrow (text)
 *   2. heading (rich — wrap the accent word in *em*)
 *   3. body copy
 *   4. buttons
 *   5. stat panel: [label, value, sublabel] — rendered as a small glass chip
 *   6. image (card render / floating visual)
 */
export default function decorate(block) {
  const rows = [...block.children];
  const copy = document.createElement('div');
  copy.className = 'product-hero-copy';
  const visual = document.createElement('div');
  visual.className = 'product-hero-visual';

  rows.forEach((row) => {
    const picture = row.querySelector('picture');
    if (picture) {
      visual.append(picture);
      return;
    }
    const cells = [...row.children];
    // a stat row has exactly 2-3 short plain-text cells and no heading/button
    const isStatRow = cells.length >= 2
      && cells.length <= 3
      && !row.querySelector('h1, h2, h3, .button-wrapper, picture')
      && cells.every((c) => c.textContent.trim().length < 40);

    if (isStatRow) {
      const [labelCell, valueCell, subCell] = cells;
      const chip = document.createElement('div');
      chip.className = 'product-hero-stat glass-card';
      chip.innerHTML = `
        <p class="product-hero-stat-label">${labelCell.textContent.trim()}</p>
        <p class="product-hero-stat-value">${valueCell.textContent.trim()}</p>
        ${subCell ? `<p class="product-hero-stat-sub">${subCell.textContent.trim()}</p>` : ''}
      `;
      visual.append(chip);
      return;
    }

    const p = row.querySelector('p');
    if (p && !row.querySelector('h1, h2, h3, .button-wrapper') && p.textContent.trim().length < 60) {
      p.classList.add('eyebrow');
    }
    copy.append(...row.children);
  });

  block.textContent = '';
  const inner = document.createElement('div');
  inner.className = 'product-hero-inner glass-card';
  inner.append(copy);
  if (visual.children.length) inner.append(visual);
  block.append(inner);
}
