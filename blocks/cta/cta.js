/**
 * Reusable CTA banner. Variant via block name, e.g. `cta (split)` renders
 * heading/body on the left and the button(s) on the right; default is
 * centered. Rows: eyebrow (optional), heading, body (optional), buttons.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'cta-inner';

  rows.forEach((row) => {
    const p = row.querySelector('p');
    if (p && !row.querySelector('h1, h2, h3') && !row.querySelector('.button-wrapper') && p.textContent.trim().length < 60) {
      p.classList.add('eyebrow');
    }
    wrapper.append(...row.children);
  });

  block.textContent = '';
  block.append(wrapper);
}
