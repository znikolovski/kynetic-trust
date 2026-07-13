/**
 * Accessible feature-matrix table (works for any number of columns).
 * Row 1 = header (Feature | Column A | Column B | ...).
 * Following rows = one feature each. A cell value of "yes"/"true" renders a
 * checkmark, "no"/"false"/"—" renders a dash, anything else renders as text.
 */
function renderCellValue(text) {
  const v = text.trim().toLowerCase();
  if (v === 'yes' || v === 'true' || v === 'check' || v === '✓') {
    return '<span class="comparison-check" aria-label="Included">✓</span>';
  }
  if (v === 'no' || v === 'false' || v === '—' || v === '-' || v === '') {
    return '<span class="comparison-dash" aria-hidden="true">—</span>';
  }
  return text;
}

export default function decorate(block) {
  const rows = [...block.children];
  const [headerRow, ...bodyRows] = rows;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');
  [...headerRow.children].forEach((cell, i) => {
    const th = document.createElement('th');
    th.innerHTML = cell.innerHTML;
    th.scope = 'col';
    if (i === 0) th.className = 'comparison-feature-col';
    headTr.append(th);
  });
  thead.append(headTr);

  const tbody = document.createElement('tbody');
  bodyRows.forEach((row) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell, i) => {
      if (i === 0) {
        const th = document.createElement('th');
        th.scope = 'row';
        th.innerHTML = cell.innerHTML;
        tr.append(th);
      } else {
        const td = document.createElement('td');
        td.innerHTML = renderCellValue(cell.textContent);
        tr.append(td);
      }
    });
    tbody.append(tr);
  });
  table.append(thead, tbody);

  block.textContent = '';
  const scroll = document.createElement('div');
  scroll.className = 'comparison-table-scroll glass-card';
  scroll.append(table);
  block.append(scroll);
}
