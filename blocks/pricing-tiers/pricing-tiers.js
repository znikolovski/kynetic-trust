/**
 * Pricing / membership tier cards (Standard / Premium / Institutional).
 * Rows: [eyebrow e.g. "Tier 01", name, price, period, description, CTA link,
 *        badge text (optional, e.g. "Most Popular"), highlight ("yes"/"no")]
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const [
      eyebrowCell, nameCell, priceCell, periodCell,
      descCell, ctaCell, badgeCell, highlightCell,
    ] = [...row.children];

    const highlighted = highlightCell?.textContent.trim().toLowerCase() === 'yes';
    const card = document.createElement('div');
    card.className = `tier-card glass-card${highlighted ? ' tier-card-highlight' : ''}`;

    if (badgeCell?.textContent.trim()) {
      const badge = document.createElement('span');
      badge.className = 'tier-card-badge';
      badge.textContent = badgeCell.textContent.trim();
      card.append(badge);
    }
    if (eyebrowCell?.textContent.trim()) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'tier-card-eyebrow';
      eyebrow.textContent = eyebrowCell.textContent.trim();
      card.append(eyebrow);
    }
    if (nameCell) {
      const name = document.createElement('h3');
      name.textContent = nameCell.textContent.trim();
      card.append(name);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'tier-card-price';
    const price = document.createElement('span');
    price.className = 'tier-card-price-value';
    price.textContent = priceCell?.textContent.trim() || '';
    priceRow.append(price);
    if (periodCell?.textContent.trim()) {
      const period = document.createElement('span');
      period.className = 'tier-card-price-period';
      period.textContent = periodCell.textContent.trim();
      priceRow.append(period);
    }
    card.append(priceRow);

    if (descCell) {
      const desc = document.createElement('p');
      desc.className = 'tier-card-desc';
      desc.innerHTML = descCell.innerHTML;
      card.append(desc);
    }

    if (ctaCell) card.append(...ctaCell.children);

    block.append(card);
  });
}
