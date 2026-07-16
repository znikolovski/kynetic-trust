/**
 * Topic tag pills. Each row = one tag label.
 * Renders a horizontal flex row of pill-shaped chips.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const list = document.createElement('ul');
  list.className = 'tags-list';

  rows.forEach((row) => {
    const label = row.textContent.trim();
    if (!label) return;
    const li = document.createElement('li');
    li.className = 'tags-item';
    li.textContent = label;
    list.append(li);
  });

  block.append(list);
}
