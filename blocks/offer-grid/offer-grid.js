/**
 * Bento-style offer grid ("Popular offers & services").
 * Each authored row is one card with cells, in order:
 *   1. size hint: "large" | "tall" | "small" | "wide" (controls the grid span)
 *   2. icon name (matches an SVG in /icons, optional)
 *   3. eyebrow label
 *   4. heading
 *   5. body copy (may contain rich HTML including nested block elements)
 *   6. CTA (a link wrapped in <strong> for primary button treatment)
 *   7. dual-purpose: input placeholder text (email capture) OR an image element (visual)
 *      - plain text → renders a labelled email input next to the CTA
 *      - contains <img>/<picture> → renders the image to the right of card content (wide cards)
 */

/**
 * Detects plain-paragraph stats authored as "LabelValue" (e.g. "Variable APR9.99%") and
 * converts them to the structured offer-card-stats layout. Handles both DA-plain format
 * and already-structured HTML (the latter passes through untouched).
 */
function parseStatParagraphs(body) {
  if (body.querySelector('.offer-card-stats')) return; // already structured
  const statParas = [...body.querySelectorAll('p')].filter((p) => {
    const t = p.textContent.trim();
    return t.length < 50 && !t.endsWith('.') && /[£€$¥%]|\d/.test(t);
  });
  if (!statParas.length) return;
  const stats = document.createElement('div');
  stats.className = 'offer-card-stats';
  statParas.forEach((para) => {
    const t = para.textContent.trim();
    const m = t.match(/^(.*?)([£€$¥][\d.,]+|\d[\d.,]*[£€$¥%]+|\d[\d.,]*)$/);
    if (m?.[1]?.trim() && m?.[2]) {
      const row = document.createElement('div');
      row.innerHTML = `<span class="offer-stat-label">${m[1].trim()}</span><span class="offer-stat-value">${m[2]}</span>`;
      stats.append(row);
      para.remove();
    }
  });
  if (stats.children.length) body.append(stats);
}

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const [sizeCell, iconCell, eyebrowCell, headingCell, bodyCell, ctaCell, cell6, bgCell] = cells;
    const sizeParts = (sizeCell?.textContent.trim().toLowerCase() || 'small').split(/\s+/);
    const size = sizeParts[0];
    const modifiers = sizeParts.slice(1);

    const card = document.createElement('div');
    card.className = `offer-card offer-card-${size} glass-card`;
    modifiers.forEach((m) => card.classList.add(`offer-card-${m}`));

    // Background image cell (cell 8): suppress ghost watermark when a real image is present
    const bgImg = bgCell?.querySelector('picture, img');
    const bgSrc = bgImg
      ? (bgImg.nodeName === 'PICTURE' ? bgImg.querySelector('img')?.src : bgImg.src) ?? null
      : null;

    const iconName = iconCell?.textContent.trim();
    // Ghost watermark: large faint icon via CSS data attribute (skip when bg image present)
    if (iconName && !iconName.includes('-') && !iconName.endsWith('.svg') && !bgSrc) {
      card.dataset.icon = iconName;
    }
    const eyebrowText = eyebrowCell?.textContent.trim();
    if (eyebrowText) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'offer-card-eyebrow';
      if (iconName) {
        const isSvgRef = iconName.includes('-') || iconName.endsWith('.svg');
        eyebrow.innerHTML = isSvgRef
          ? `<span class="icon icon-${iconName}"></span>`
          : `<span class="material-symbol" aria-hidden="true">${iconName}</span>`;
      }
      const label = document.createElement('span');
      label.textContent = eyebrowText;
      eyebrow.append(label);
      card.append(eyebrow);
    }

    if (headingCell) {
      const heading = document.createElement('h3');
      heading.innerHTML = headingCell.innerHTML;
      card.append(heading);
    }

    if (bodyCell?.textContent.trim()) {
      const body = document.createElement('div');
      body.className = 'offer-card-body';
      body.innerHTML = bodyCell.innerHTML;
      parseStatParagraphs(body);
      card.append(body);
    }

    const actions = document.createElement('div');
    actions.className = 'offer-card-actions';

    // cell6 is either an email input placeholder (text) or an image visual (contains img/picture)
    const cell6Visual = cell6?.querySelector('picture, img');
    const inputCell = cell6Visual ? null : cell6;

    if (inputCell?.textContent.trim()) {
      const label = document.createElement('label');
      label.className = 'offer-card-input-label';
      label.textContent = inputCell.textContent.trim();
      const input = document.createElement('input');
      input.type = 'email';
      input.placeholder = 'name@domain.com';
      input.setAttribute('aria-label', inputCell.textContent.trim());
      actions.append(label, input);
    }

    if (ctaCell) actions.append(...ctaCell.children);
    card.append(actions);

    // Image visual: wrap existing card content and add the image to the right
    if (cell6Visual) {
      const content = document.createElement('div');
      content.className = 'offer-card-content';
      content.append(...card.children);
      const visual = document.createElement('div');
      visual.className = 'offer-card-visual';
      visual.append(cell6Visual);
      card.append(content, visual);
      card.classList.add('offer-card-has-visual');
    }

    if (bgSrc) {
      card.classList.add('offer-card-has-bg');
      card.style.backgroundImage = `url(${bgSrc})`;
    }

    block.append(card);
  });
}
