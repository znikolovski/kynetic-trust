// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Fixed-Rate Mortgage',
    description: 'Lock in a stable rate for 15, 20, or 30-year terms to protect against market volatility, with a 30-minute decision.',
    image_url: 'https://www.securbank.run.place/media_13d0362b5777d9597d93d6cf7be47268980f92e5b.jpg?width=1200&format=pjpg&optimize=medium',
    price: 'Rates from 5.25% APR',
    category: 'Mortgage',
  },
  {
    name: 'High Yield Savings',
    description: 'Institutional-grade savings account with automated high-yield routing, zero monthly fees, and real-time transfers.',
    image_url: 'https://www.securbank.run.place/media_1a044ecc6a78886d03194d592d1a9aa06fe0ec817.jpg?width=1200&format=pjpg&optimize=medium',
    price: '5.15% APY',
    category: 'Savings',
  },
  {
    name: 'SecurBank Premium',
    description: 'No foreign transaction fees, late fee waiver, no penalty APR, and cash back in case of robbery.',
    image_url: 'https://www.securbank.run.place/media_1d5bf5c1f6217d4e0c836372a92bca666f1a37eca.png?width=1200&format=pjpg&optimize=medium',
    price: 'No monthly fee if you spend $4,000+/period, otherwise $35/mo',
    category: 'Credit Card',
  },
  {
    name: 'SecurBank Travel Elite',
    description: 'For frequent flyers: 3x points on flights, hotels and dining, complimentary lounge access, and travel insurance.',
    price: '$25/mo',
    category: 'Credit Card',
  },
  {
    name: 'SecurBank Cashback Everyday',
    description: '5% cashback on groceries and fuel, 2% on utilities and streaming, 1% on everything else, with no rewards cap.',
    price: 'No monthly fee if you spend $1,500+/period',
    category: 'Credit Card',
  },
  {
    name: 'SecurBank Business Pro',
    description: 'Unlimited employee cards at no extra cost, 2% cashback on office supplies and software, and quarterly expense reporting.',
    price: '$15/mo',
    category: 'Credit Card',
  },
  {
    name: 'SecurBank Secured Builder',
    description: 'Rebuild or establish credit with a refundable security deposit, monthly reporting to all bureaus, and no credit history required.',
    price: 'No monthly fee',
    category: 'Credit Card',
  },
  {
    name: 'SecurBank Student Starter',
    description: 'Built for students: 1% cashback on everyday purchases, free credit score monitoring, and first-slip late-fee forgiveness.',
    price: 'No monthly fee',
    category: 'Credit Card',
  },
  {
    name: 'Adjustable Rate Mortgage (ARM)',
    description: 'Lower initial rates ideal for tactical buyers planning to move or refinance within 5-10 years.',
    image_url: 'https://www.securbank.run.place/media_1eee9f0a0f5fd8b87128d349a6be45f77fe8d80f4.jpg?width=1200&format=pjpg&optimize=medium',
    price: 'From 3.5% down payment',
    category: 'Mortgage',
  },
  {
    name: 'Jumbo Loan',
    description: 'High-value financing that exceeds conforming loan limits, with competitive rates and bespoke servicing.',
    price: 'Rates from 5.25% APR',
    category: 'Mortgage',
  },
];

// Brand palette from the action payload (empty here → fallback #1a1a1a / #fff).
const PALETTE = [];

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);
const stripBg = theme?.bg ?? '#1a1a1a';
const stripFg = theme?.fg ?? '#fff';

function renderItems(block, items, bridge) {
  block.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'list-banking-products-wrapper';

  const track = document.createElement('div');
  track.className = 'list-banking-products-track';

  (items || []).slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'lbp-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'lbp-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'lbp-info';
    info.style.cssText = `background:${stripBg};color:${stripFg};`;

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'lbp-badge';
      badge.textContent = item.category;
      info.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.className = 'lbp-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.price) {
      const price = document.createElement('div');
      price.className = 'lbp-price';
      price.textContent = item.price;
      info.appendChild(price);
    }

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'lbp-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const btn = document.createElement('button');
    btn.className = 'lbp-cta';
    btn.type = 'button';
    btn.textContent = 'View Details';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'lbp-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${stripBg}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  const scrollByCard = (dir) => {
    const first = track.querySelector('.lbp-card');
    const delta = first ? first.offsetWidth + 16 : 226;
    track.scrollBy({ left: dir * delta, behavior: 'smooth' });
  };

  const leftBtn = document.createElement('button');
  leftBtn.className = 'lbp-nav lbp-nav-left';
  leftBtn.type = 'button';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  leftBtn.addEventListener('click', () => scrollByCard(-1));

  const rightBtn = document.createElement('button');
  rightBtn.className = 'lbp-nav lbp-nav-right';
  rightBtn.type = 'button';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';
  rightBtn.addEventListener('click', () => scrollByCard(1));

  const updateNav = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateNav);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);
  requestAnimationFrame(updateNav);
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.products — bare array outputSchema; key derived from actionName "list_banking_products"
      items = structuredContent?.products || [];
    }
    renderItems(block, items, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    items = SAMPLE_DATA;
    renderItems(block, items, bridge);
  }
}
