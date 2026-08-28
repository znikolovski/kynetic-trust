// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Fixed-Rate Mortgage',
  description: 'Lock in a stable rate for 15, 20, or 30-year terms to protect against market volatility, with a 30-minute decision.',
  image_url: 'https://www.securbank.run.place/media_13d0362b5777d9597d93d6cf7be47268980f92e5b.jpg?width=1200&format=pjpg&optimize=medium',
  price: 'Rates from 5.25% APR',
  category: 'Mortgage',
};

// Brand palette from the action payload (empty here → fallback dark header).
const PALETTE = [];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

const FIELDS = [
  { key: 'home_value', label: 'Home Value', placeholder: 'Purchase price of the home in USD.', type: 'number', min: 0, step: 1000 },
  { key: 'down_payment', label: 'Down Payment', placeholder: 'Down payment as a percentage of the home value.', type: 'number', min: 3.5, step: 0.5, suffix: '%' },
  { key: 'rate', label: 'Rate', placeholder: 'Annual interest rate as a percentage.', type: 'number', min: 0, step: 0.05, suffix: '%' },
  { key: 'term', label: 'Term', placeholder: 'Loan term in years.', type: 'select', options: [15, 20, 30] },
];

function fmtCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function computePayment({ home_value, down_payment, rate, term }) {
  const principal = home_value - (home_value * (down_payment / 100));
  const monthlyRate = rate / 100 / 12;
  const n = term * 12;
  let monthly;
  if (monthlyRate === 0) {
    monthly = principal / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    monthly = principal * (monthlyRate * factor) / (factor - 1);
  }
  const totalInterest = monthly * n - principal;
  return { estimated_monthly_payment: Math.round(monthly), total_interest: Math.round(totalInterest) };
}

export default async function decorate(block, bridge) {
  let plan = SAMPLE_DATA;
  let result = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      if (typeof structuredContent.estimated_monthly_payment === 'number') {
        result = structuredContent;
      }
    }
  }

  block.textContent = '';
  renderCalculator(block, plan, bridge, result);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderCalculator(block, plan, bridge, initialResult) {
  const card = document.createElement('div');
  card.className = 'calculate-payment-card';

  // Hero image
  const hero = document.createElement('div');
  hero.className = 'calculate-payment-hero';
  if (plan.image_url) {
    const img = document.createElement('img');
    img.src = plan.image_url;
    img.alt = plan.name || 'Mortgage';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
      img.parentNode.replaceChild(d, img);
    };
    hero.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    hero.appendChild(d);
  }
  card.appendChild(hero);

  // Header block with palette bg
  const header = document.createElement('div');
  header.className = 'calculate-payment-header';
  header.style.cssText = `background:${theme?.bg ?? '#111827'};color:${theme?.fg ?? '#fff'};`;
  const title = document.createElement('h3');
  title.className = 'calculate-payment-title';
  title.textContent = plan.name || 'Mortgage Payment Calculator';
  header.appendChild(title);
  if (plan.description) {
    const desc = document.createElement('p');
    desc.className = 'calculate-payment-desc';
    desc.textContent = plan.description;
    header.appendChild(desc);
  }
  card.appendChild(header);

  // Form
  const form = document.createElement('form');
  form.className = 'calculate-payment-form';
  form.noValidate = true;

  const inputs = {};
  FIELDS.forEach((f) => {
    const wrap = document.createElement('label');
    wrap.className = 'calculate-payment-field';
    const lbl = document.createElement('span');
    lbl.className = 'calculate-payment-label';
    lbl.textContent = `${f.label} *`;
    wrap.appendChild(lbl);

    let input;
    if (f.type === 'select') {
      input = document.createElement('select');
      f.options.forEach((opt) => {
        const o = document.createElement('option');
        o.value = String(opt);
        o.textContent = `${opt} years`;
        if (opt === 30) o.selected = true;
        input.appendChild(o);
      });
    } else {
      input = document.createElement('input');
      input.type = 'number';
      input.placeholder = f.placeholder;
      if (f.min != null) input.min = String(f.min);
      if (f.step != null) input.step = String(f.step);
      input.required = true;
    }
    input.className = 'calculate-payment-input';
    input.setAttribute('aria-label', f.label);
    wrap.appendChild(input);
    inputs[f.key] = input;
    form.appendChild(wrap);
  });

  card.appendChild(form);

  // Result area
  const resultArea = document.createElement('div');
  resultArea.className = 'calculate-payment-result';
  resultArea.hidden = true;
  card.appendChild(resultArea);

  function showResult(res) {
    resultArea.textContent = '';
    resultArea.hidden = false;
    const mLabel = document.createElement('span');
    mLabel.className = 'calculate-payment-result-label';
    mLabel.textContent = 'Estimated Monthly Payment';
    const mVal = document.createElement('strong');
    mVal.className = 'calculate-payment-result-value';
    mVal.textContent = fmtCurrency(res.estimated_monthly_payment);
    resultArea.appendChild(mLabel);
    resultArea.appendChild(mVal);
    if (typeof res.total_interest === 'number') {
      const ti = document.createElement('span');
      ti.className = 'calculate-payment-result-sub';
      ti.textContent = `Total interest: ${fmtCurrency(res.total_interest)}`;
      resultArea.appendChild(ti);
    }
  }

  // CTA
  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'calculate-payment-cta';
  btn.textContent = 'Calculate Payment';
  form.appendChild(btn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const vals = {
      home_value: parseFloat(inputs.home_value.value),
      down_payment: parseFloat(inputs.down_payment.value),
      rate: parseFloat(inputs.rate.value),
      term: parseInt(inputs.term.value, 10),
    };
    if ([vals.home_value, vals.down_payment, vals.rate, vals.term].some((v) => Number.isNaN(v))) {
      resultArea.textContent = '';
      resultArea.hidden = false;
      const err = document.createElement('span');
      err.className = 'calculate-payment-result-sub';
      err.textContent = 'Please fill in all fields.';
      resultArea.appendChild(err);
      return;
    }
    showResult(computePayment(vals));
  });

  block.appendChild(card);

  if (initialResult) showResult(initialResult);
}
