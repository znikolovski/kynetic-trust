/**
 * Repeating icon + heading + body list ("We made it simple").
 * Rows: [icon name, heading, body]
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const [iconCell, headingCell, bodyCell] = [...row.children];
    const item = document.createElement('div');
    item.className = 'feature-list-item';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'feature-list-icon';
    const iconName = iconCell?.textContent.trim();
    if (iconName) iconWrap.innerHTML = `<span class="icon icon-${iconName}"></span>`;

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
