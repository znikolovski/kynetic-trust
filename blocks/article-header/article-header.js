/**
 * Editorial article hero. Rows: background image, [category, read time],
 * heading, dek/summary, [author image], [author name, author role].
 */
export default function decorate(block) {
  const rows = [...block.children];
  const meta = document.createElement('div');
  meta.className = 'article-header-meta';
  const copy = document.createElement('div');
  copy.className = 'article-header-copy';
  const byline = document.createElement('div');
  byline.className = 'article-header-byline';
  let heroPicture = null;

  rows.forEach((row) => {
    const cells = [...row.children];

    // Background hero image: first single-cell row with an image, before copy is populated
    if (!heroPicture && cells.length === 1 && !copy.children.length) {
      const media = row.querySelector('picture') ?? row.querySelector('img');
      if (media) {
        heroPicture = media;
        return;
      }
    }

    if (cells.length === 2 && cells.every((c) => !c.querySelector('img')) && !row.querySelector('h1, h2')) {
      const [tagCell, timeCell] = cells;
      if (tagCell.textContent.trim() && !copy.children.length) {
        meta.innerHTML = `<span class="article-tag">${tagCell.textContent.trim()}</span>
          <span class="article-readtime">${timeCell.textContent.trim()}</span>`;
        return;
      }
      const [nameCell, roleCell] = cells;
      byline.innerHTML += `<div class="article-byline-text">
          <p class="article-byline-name">${nameCell.textContent.trim()}</p>
          <p class="article-byline-role">${roleCell.textContent.trim()}</p>
        </div>`;
      return;
    }
    if (cells.length === 1 && cells[0].querySelector('img')) {
      const avatar = document.createElement('div');
      avatar.className = 'article-byline-avatar';
      avatar.append(cells[0].querySelector('picture') ?? cells[0].querySelector('img'));
      byline.prepend(avatar);
      return;
    }
    copy.append(...row.children);
  });

  block.textContent = '';
  if (heroPicture) block.append(heroPicture);
  const overlay = document.createElement('div');
  overlay.className = 'article-header-overlay';
  overlay.append(meta, copy);
  if (byline.children.length) overlay.append(byline);
  block.append(overlay);
}
