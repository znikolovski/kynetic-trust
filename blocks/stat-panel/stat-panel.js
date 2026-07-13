/**
 * Small stat callout chip, e.g. "Current High Yield · 5.85% APY".
 * Rows: [icon name], [label], [value], [sublabel]
 * All cells optional except value.
 */
export default function decorate(block) {
  const [iconRow, labelRow, valueRow, subRow] = [...block.children];
  const icon = iconRow?.textContent.trim();
  const label = labelRow?.textContent.trim();
  const value = valueRow?.textContent.trim();
  const sub = subRow?.textContent.trim();

  block.textContent = '';
  const panel = document.createElement('div');
  panel.className = 'stat-panel-inner glass-card';

  const text = document.createElement('div');
  if (label) {
    const l = document.createElement('p');
    l.className = 'stat-panel-label';
    l.textContent = label;
    text.append(l);
  }
  if (value) {
    const v = document.createElement('p');
    v.className = 'stat-panel-value';
    v.textContent = value;
    text.append(v);
  }
  if (sub) {
    const s = document.createElement('p');
    s.className = 'stat-panel-sub';
    s.textContent = sub;
    text.append(s);
  }
  panel.append(text);

  if (icon) {
    const iconWrap = document.createElement('div');
    iconWrap.className = 'stat-panel-icon';
    iconWrap.innerHTML = `<span class="icon icon-${icon}"></span>`;
    panel.append(iconWrap);
  }

  block.append(panel);
}
