/**
 * Repeating icon + heading + body list ("We made it simple").
 * Rows: [icon name, heading, body, modifier?]
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const isCards = block.classList.contains('cards');

  rows.forEach((row) => {
    const [iconCell, headingCell, bodyCell, modifierCell] = [...row.children];
    const item = document.createElement('div');
    item.className = 'feature-list-item';
    if (isCards) item.classList.add('glass-card');

    const modifier = modifierCell?.textContent.trim().toLowerCase();
    if (modifier) item.classList.add(`feature-list-item-${modifier}`);

    const iconWrap = document.createElement('div');
    iconWrap.className = 'feature-list-icon';
    const iconImg = iconCell?.querySelector('picture, img');
    const iconName = iconCell?.textContent.trim();
    if (iconImg) {
      iconWrap.append(iconImg);
    } else if (iconName) {
      const isSvgRef = iconName.includes('-') || iconName.endsWith('.svg');
      iconWrap.innerHTML = isSvgRef
        ? `<span class="icon icon-${iconName}"></span>`
        : `<span class="material-symbol" aria-hidden="true">${iconName}</span>`;
    }

    const text = document.createElement('div');
    if (headingCell) {
      const h = document.createElement('h4');
      h.innerHTML = headingCell.innerHTML;
      text.append(h);
    }
    if (bodyCell) {
      const p = document.createElement('p');
      p.innerHTML = bodyCell.innerHTML;
      text.append(p);
    }

    item.append(iconWrap, text);
    block.append(item);
  });
}
