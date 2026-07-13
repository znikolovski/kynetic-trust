/**
 * Bento-style offer grid ("Popular offers & services").
 * Each authored row is one card with cells, in order:
 *   1. size hint: "large" | "small" | "wide" (controls the grid span)
 *   2. icon name (matches an SVG in /icons, optional)
 *   3. eyebrow label
 *   4. heading
 *   5. body copy
 *   6. CTA (a link, or an email capture form if the 7th cell is present)
 *   7. optional: input placeholder text -> renders an email capture field
 *      next to the CTA (used for the mortgage waitlist card)
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const [sizeCell, iconCell, eyebrowCell, headingCell, bodyCell, ctaCell, inputCell] = cells;
    const size = sizeCell?.textContent.trim().toLowerCase() || 'small';

    const card = document.createElement('div');
    card.className = `offer-card offer-card-${size} glass-card`;

    if (eyebrowCell?.textContent.trim()) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'offer-card-eyebrow';
      if (iconCell?.textContent.trim()) {
        eyebrow.innerHTML = `<span class="icon icon-${iconCell.textContent.trim()}"></span>`;
      }
      const label = document.createElement('span');
      label.textContent = eyebrowCell.textContent.trim();
      eyebrow.append(label);
      card.append(eyebrow);
    }

    if (headingCell) {
      const heading = document.createElement('h3');
      heading.innerHTML = headingCell.innerHTML;
      card.append(heading);
    }

    if (bodyCell?.textContent.trim()) {
      const body = document.createElement('p');
      body.innerHTML = bodyCell.innerHTML;
      card.append(body);
    }

    const actions = document.createElement('div');
    actions.className = 'offer-card-actions';

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

    block.append(card);
  });
}
