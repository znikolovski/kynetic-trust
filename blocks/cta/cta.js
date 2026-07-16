/**
 * Reusable CTA banner. Variant via block name, e.g. `cta (split)` renders
 * heading/body on the left and the button(s) on the right; default is
 * centered. Rows: eyebrow (optional), heading, body (optional), buttons.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'cta-inner';

  let headingFound = false;
  let buttonFound = false;
  let bgSrc = null;

  rows.forEach((row) => {
    const pic = row.querySelector('picture, img');
    if (pic && !row.querySelector('h1, h2, h3, a')) {
      const imgEl = pic.nodeName === 'PICTURE' ? pic.querySelector('img') : pic;
      bgSrc = imgEl?.src ?? null;
      return;
    }
    if (row.querySelector('h1, h2, h3')) {
      headingFound = true;
    } else if (!headingFound && !row.querySelector('.button-wrapper')) {
      [...row.querySelectorAll('p')].forEach((p) => {
        if (p.textContent.trim().length < 60) p.classList.add('eyebrow');
      });
    }
    if (buttonFound) {
      const innerDiv = row.firstElementChild;
      if (innerDiv) innerDiv.classList.add('cta-footnote');
    }
    if (row.querySelector('.button-wrapper')) buttonFound = true;
    wrapper.append(...row.children);
  });

  block.textContent = '';
  block.append(wrapper);

  if (bgSrc) {
    block.classList.add('cta-bg-image');
    block.style.backgroundImage = `url(${bgSrc})`;
  }
}
