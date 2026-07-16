/**
 * Interactive mortgage calculator — self-contained, no external dependencies.
 * Authored row (optional): [home value, interest rate, loan term years]
 */

const RATES = [3.5, 4.0, 4.25, 4.5, 5.0];
const TERMS = [15, 20, 30];
const HOME_MIN = 100000;
const HOME_MAX = 2000000;

function calcMonthly(principal, annualRate, termYears) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

function fmtMoney(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function sliderPct(v) {
  return `${(((v - HOME_MIN) / (HOME_MAX - HOME_MIN)) * 100).toFixed(1)}%`;
}

export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children ?? [])];
  let homeValue = parseInt(cells[0]?.textContent.trim(), 10) || 750000;
  const initRate = parseFloat(cells[1]?.textContent.trim()) || 4.25;
  const initTerm = parseInt(cells[2]?.textContent.trim(), 10) || 30;

  let rateIdx = RATES.indexOf(initRate);
  if (rateIdx < 0) rateIdx = 2;
  let termIdx = TERMS.indexOf(initTerm);
  if (termIdx < 0) termIdx = 2;

  block.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'mc-card glass-card';
  card.innerHTML = `
    <div class="mc-header">
      <span class="mc-header-label">Interactive Modeler</span>
      <span class="material-symbol" aria-hidden="true">settings</span>
    </div>
    <div class="mc-field">
      <div class="mc-field-row">
        <label class="mc-field-label" for="mc-slider">Home Value</label>
        <span class="mc-field-value" id="mc-home-val">${fmtMoney(homeValue)}</span>
      </div>
      <input class="mc-slider" type="range" id="mc-slider"
        min="${HOME_MIN}" max="${HOME_MAX}" step="5000" value="${homeValue}"
        aria-label="Home value slider">
    </div>
    <div class="mc-tiles">
      <button class="mc-tile" id="mc-rate-tile" aria-label="Cycle interest rate">
        <span class="mc-tile-label">Interest Rate</span>
        <span class="mc-tile-value" id="mc-rate-val">${RATES[rateIdx]}%</span>
      </button>
      <button class="mc-tile" id="mc-term-tile" aria-label="Cycle loan term">
        <span class="mc-tile-label">Loan Term</span>
        <span class="mc-tile-value" id="mc-term-val">${TERMS[termIdx]} Years</span>
      </button>
    </div>
    <div class="mc-result">
      <span class="mc-result-label">Estimated Monthly Payment</span>
      <span class="mc-result-value" id="mc-payment"></span>
    </div>
    <a href="/register?type=mortgage" class="mc-cta">Apply With This Rate</a>
  `;

  block.append(card);

  const slider = card.querySelector('.mc-slider');
  const homeVal = card.querySelector('#mc-home-val');
  const rateVal = card.querySelector('#mc-rate-val');
  const termVal = card.querySelector('#mc-term-val');
  const payment = card.querySelector('#mc-payment');

  function update() {
    homeVal.textContent = fmtMoney(homeValue);
    rateVal.textContent = `${RATES[rateIdx]}%`;
    termVal.textContent = `${TERMS[termIdx]} Years`;
    payment.textContent = fmtMoney(calcMonthly(homeValue, RATES[rateIdx], TERMS[termIdx]));
    slider.style.setProperty('--pct', sliderPct(homeValue));
  }

  slider.addEventListener('input', () => {
    homeValue = parseInt(slider.value, 10);
    update();
  });

  card.querySelector('#mc-rate-tile').addEventListener('click', () => {
    rateIdx = (rateIdx + 1) % RATES.length;
    update();
  });

  card.querySelector('#mc-term-tile').addEventListener('click', () => {
    termIdx = (termIdx + 1) % TERMS.length;
    update();
  });

  update();
}
