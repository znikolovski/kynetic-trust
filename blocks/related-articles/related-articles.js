/**
 * Related-content card grid. Rows: [image, category, heading, link]
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const [imageCell, categoryCell, headingCell, linkCell] = [...row.children];
    const link = linkCell?.querySelector('a') || headingCell?.querySelector('a');
    const href = link?.getAttribute('href') || '#';

    const card = document.createElement('a');
    card.className = 'related-article-card';
    card.href = href;

    const media = document.createElement('div');
    media.className = 'related-article-media';
    const picture = imageCell?.querySelector('picture') ?? imageCell?.querySelector('img');
    if (picture) media.append(picture);
    card.append(media);

    if (categoryCell?.textContent.trim()) {
      const cat = document.createElement('span');
      cat.className = 'related-article-category';
      cat.textContent = categoryCell.textContent.trim();
      card.append(cat);
    }

    const heading = document.createElement('h3');
    heading.textContent = headingCell?.textContent.trim() || '';
    card.append(heading);

    block.append(card);
  });
}
