import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const columns = ['brand', 'links', 'legal'];
  columns.forEach((c, i) => {
    const col = footer.children[i];
    if (col) col.classList.add(`footer-${c}`);
  });

  // Inject logo from code bus — bypasses content-pipeline img sanitization
  const brandCol = footer.querySelector('.footer-brand');
  if (brandCol) {
    brandCol.querySelectorAll('img').forEach((el) => el.remove());
    const logoImg = document.createElement('img');
    logoImg.src = '/icons/securbank-logo.svg';
    logoImg.alt = 'SecurBank';
    logoImg.className = 'brand-logo';
    const firstP = brandCol.querySelector('p') ?? brandCol;
    firstP.prepend(logoImg);
  }

  block.append(footer);
}
