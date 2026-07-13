/**
 * Hero block. Authored rows (in order), all optional except heading:
 *   1. background image (picture)
 *   2. eyebrow text, e.g. "EST. 2024 · INSTITUTIONAL GRADE"
 *   3. heading (rich text — wrap a word in *em* for the cyan accent)
 *   4. body copy
 *   5. CTA paragraph (buttons — see styles.css)
 */
export default function decorate(block) {
  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-media';

  const content = document.createElement('div');
  content.className = 'hero-content';

  let sawHeading = false;
  rows.forEach((row) => {
    const picture = row.querySelector('picture');
    if (picture) {
      media.append(picture);
      return;
    }

    const p = row.querySelector('p');
    if (!sawHeading && p && !row.querySelector('h1, h2') && p.textContent.trim()) {
      p.classList.add('eyebrow');
    }
    if (row.querySelector('h1, h2')) sawHeading = true;

    content.append(...row.children);
  });

  block.textContent = '';
  if (media.children.length) block.append(media);
  block.append(content);
}
