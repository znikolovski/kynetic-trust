/**
 * Editorial pull-quote. Rows: [quote text], [citation (optional)].
 */
export default function decorate(block) {
  const [quoteRow, citeRow] = [...block.children];
  block.textContent = '';

  const quote = document.createElement('h2');
  quote.innerHTML = quoteRow.innerHTML;
  block.append(quote);

  if (citeRow?.textContent.trim()) {
    const cite = document.createElement('cite');
    cite.textContent = citeRow.textContent.trim();
    block.append(cite);
  }
}
