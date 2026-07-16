/**
 * Large glassmorphic hero used on product pages (Credit Cards, Accounts &
 * Savings). Rows, all optional except heading:
 *   1. eyebrow (text)
 *   2. heading (rich — wrap the accent word in <em>)
 *   3. body copy
 *   4. buttons
 *   5. featured stat: [label, value, sublabel] — 3 cells → left copy column
 *   6+ dashboard stats: [label, value] — 2 cells → right visual column
 *   any row with an image → right visual column
 *
 * Cell-count rule for stat rows:
 *   3 cells = featured stat chip (inline with copy, cyan glow)
 *   2 cells = dashboard stat (first 2 → tile grid, rest → status row)
 */
export default function decorate(block) {
  const rows = [...block.children];
  const copy = document.createElement('div');
  copy.className = 'product-hero-copy';
  const visual = document.createElement('div');
  visual.className = 'product-hero-visual';
  let featuredChip = null;

  rows.forEach((row) => {
    const picture = row.querySelector('picture') ?? (!row.querySelector('h1,h2,h3') && !row.querySelector('a') && row.querySelector('img'));
    if (picture) {
      visual.append(picture);
      return;
    }
    const cells = [...row.children];
    const isStatRow = cells.length >= 2
      && cells.length <= 3
      && !row.querySelector('h1, h2, h3, .button-wrapper, picture')
      && cells.every((c) => c.textContent.trim().length < 40);

    if (isStatRow) {
      const [labelCell, valueCell, subCell] = cells;
      const chip = document.createElement('div');

      if (cells.length === 3) {
        // Featured stat → left copy column (no .product-hero-stat to avoid grid conflict)
        chip.className = 'product-hero-stat-featured glass-card';
        chip.innerHTML = `
          <p class="product-hero-stat-label">${labelCell.textContent.trim()}</p>
          <p class="product-hero-stat-value">${valueCell.textContent.trim()}</p>
          <p class="product-hero-stat-sub">${subCell.textContent.trim()}</p>
        `;
        featuredChip = chip;
      } else {
        // Dashboard stat → right visual column (accumulated, then restructured below)
        chip.className = 'product-hero-stat';
        chip.innerHTML = `
          <p class="product-hero-stat-label">${labelCell.textContent.trim()}</p>
          <p class="product-hero-stat-value">${valueCell.textContent.trim()}</p>
        `;
        visual.append(chip);
      }
      return;
    }

    const p = row.querySelector('p');
    if (p && !row.querySelector('h1, h2, h3, .button-wrapper, a') && p.textContent.trim().length < 60) {
      p.classList.add('eyebrow');
    }
    copy.append(...row.children);
  });

  block.textContent = '';
  const inner = document.createElement('div');
  inner.className = 'product-hero-inner glass-card';
  inner.append(copy);

  if (visual.children.length) {
    // Build the full dashboard widget from collected stats
    const dashStats = [...visual.querySelectorAll('.product-hero-stat')];
    if (dashStats.length) {
      const dashboard = document.createElement('div');
      dashboard.className = 'product-hero-dashboard glass-card';

      // Header row: wallet icon + ACTIVE badge
      const header = document.createElement('div');
      header.className = 'product-hero-dashboard-header';
      header.innerHTML = '<span class="material-symbol">account_balance_wallet</span><span class="product-hero-dashboard-badge">ACTIVE</span>';
      dashboard.append(header);

      // Cyan progress bar (75% filled)
      const bar = document.createElement('div');
      bar.className = 'product-hero-dashboard-bar';
      bar.innerHTML = '<div class="product-hero-dashboard-fill"></div>';
      dashboard.append(bar);

      // First 2 stats → 2-column tile grid
      const tileStats = dashStats.slice(0, 2);
      if (tileStats.length) {
        const tilesContainer = document.createElement('div');
        tilesContainer.className = 'product-hero-dashboard-tiles';
        tileStats.forEach((s) => {
          s.className = 'product-hero-stat-tile glass-card';
          tilesContainer.append(s);
        });
        dashboard.append(tilesContainer);
      }

      // Featured stat chip sits just above the last element
      if (featuredChip) dashboard.append(featuredChip);

      // Remaining stats → status row at bottom (last element)
      const rowStats = dashStats.slice(2);
      if (rowStats.length) {
        const statusContainer = document.createElement('div');
        statusContainer.className = 'product-hero-dashboard-status';
        rowStats.forEach((s) => {
          s.className = 'product-hero-stat-row';
          statusContainer.append(s);
        });
        dashboard.append(statusContainer);
      }

      // Preserve any background image that was placed in the visual column
      const bgEl = visual.querySelector('picture, img');
      const bgSrc = bgEl
        ? (bgEl.nodeName === 'PICTURE' ? bgEl.querySelector('img')?.src : bgEl.src) ?? null
        : null;

      // Replace raw visual content with the fully built dashboard
      visual.textContent = '';
      visual.append(dashboard);

      if (bgSrc) {
        visual.classList.add('product-hero-visual-bg');
        visual.style.backgroundImage = `url(${bgSrc})`;
      }
    }
    inner.append(visual);
  }

  block.append(inner);
}
