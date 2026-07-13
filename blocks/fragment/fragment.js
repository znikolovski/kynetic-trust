// eslint-disable-next-line import/no-cycle
import { decorateMain } from '../../scripts/scripts.js';
import { loadSections } from '../../scripts/aem.js';

/**
 * Loads a fragment (e.g. /nav, /footer, or an authored content fragment
 * referenced via a `/fragments/...` link) and decorates it like a page.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} the fragment's <main> root element
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = document.createElement('div');
    fragmentSection.append(...fragment.childNodes);
    block.closest('.section').classList.add(...fragment.classList);
    block.closest('.section').replaceChildren(fragmentSection);
  }
}
