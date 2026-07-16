import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import {
  authenticate, validateAuth, isAuthenticated, clearAuth,
} from '../../scripts/auth.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) drop.setAttribute('tabindex', 0);
      });
    } else {
      navDrops.forEach((drop) => drop.removeAttribute('tabindex'));
    }
  }
}

/** Mount the built-in fallback login dialog (used when widgets.json is absent). */
function mountFallbackLoginModal() {
  if (document.querySelector('#sb-login-modal')) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'sb-login-modal';
  dialog.innerHTML = `
    <div class="login-modal-inner">
      <div class="login-modal-header">
        <span class="eyebrow">Institutional Grade</span>
        <button class="login-modal-close" aria-label="Close" type="button">&#x2715;</button>
      </div>
      <h2>Sign In</h2>
      <form class="login-modal-form" novalidate>
        <div class="login-credentials-card">
          <p class="login-section-label">
            <span class="material-symbol" aria-hidden="true">lock</span>
            Credentials
          </p>
          <input type="email" name="email" placeholder="you@institution.com" autocomplete="email" required>
          <div class="login-password-wrapper">
            <input type="password" name="password" placeholder="••••••••" autocomplete="current-password" required>
            <button type="button" class="login-eye-toggle" aria-label="Toggle password visibility">
              <span class="material-symbol" aria-hidden="true">visibility</span>
            </button>
          </div>
        </div>
        <p class="login-error" aria-live="assertive" hidden>Incorrect credentials. Please try again.</p>
        <button type="submit" class="button primary login-submit">Sign In</button>
      </form>
      <p class="login-modal-footer">Don't have an account? <a href="/accounts-savings">Open Account</a></p>
    </div>`;
  document.body.append(dialog);

  // Proxy element so the click handler's querySelector finds it
  if (!document.querySelector('sb-widget-login-modal')) {
    document.body.append(document.createElement('sb-widget-login-modal'));
  }

  window.addEventListener('sb-login-open', () => {
    dialog.querySelector('.login-error')?.removeAttribute('hidden');
    dialog.querySelector('.login-error')?.setAttribute('hidden', '');
    dialog.showModal();
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.querySelector('.login-modal-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.login-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.login-submit');
    const errorEl = form.querySelector('.login-error');
    const identifier = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';
    if (errorEl) errorEl.setAttribute('hidden', '');

    const result = await authenticate(identifier, password);

    if (result) {
      window.dispatchEvent(new CustomEvent('sb-auth-change', { detail: { authenticated: true } }));
      dialog.close();
      submitBtn.textContent = 'Sign In';
    } else {
      if (errorEl) errorEl.removeAttribute('hidden');
      submitBtn.textContent = 'Sign In';
    }
    submitBtn.disabled = false;
  });
  dialog.querySelector('.login-eye-toggle').addEventListener('click', () => {
    const pw = dialog.querySelector('input[name="password"]');
    const icon = dialog.querySelector('.login-eye-toggle .material-symbol');
    pw.type = pw.type === 'password' ? 'text' : 'password';
    icon.textContent = pw.type === 'password' ? 'visibility' : 'visibility_off';
  });
}

/** Load the login-modal widget from the pinned widgets.json entry. */
async function loadLoginWidget() {
  try {
    const registry = await fetch('/widgets.json').then((r) => r.json());
    const entry = registry['login-modal'];
    if (!entry?.file || !entry?.appOrigin) throw new Error('no widget entry');
    const src = `${entry.appOrigin}${entry.file}`;
    await new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.append(s);
    });
    // Mount the singleton element — the widget appends the dialog to body
    if (!document.querySelector('sb-widget-login-modal')) {
      document.body.append(document.createElement('sb-widget-login-modal'));
    }
  } catch {
    mountFallbackLoginModal();
  }
}

/** Reflect auth state onto the Sign In / Sign Out control. */
function updateAuthControl(signInEl, authenticated) {
  if (!signInEl) return;
  if (authenticated) {
    signInEl.textContent = 'Sign Out';
    signInEl.href = '#';
    signInEl.dataset.authState = 'signed-in';
  } else {
    signInEl.textContent = 'Sign In';
    signInEl.href = '/login';
    signInEl.dataset.authState = 'signed-out';
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand ? navBrand.querySelector('a') : null;
  if (brandLink) brandLink.className = 'brand-link';

  // Style brand logo image
  const brandImg = navBrand?.querySelector('img');
  if (brandImg) brandImg.className = 'brand-logo';

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const currentPath = window.location.pathname;
    navSections.querySelectorAll('ul > li').forEach((li) => {
      if (li.querySelector('ul')) li.classList.add('nav-drop');
      li.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = li.getAttribute('aria-expanded') === 'true';
          navSections.querySelectorAll('ul > li').forEach((n) => n.setAttribute('aria-expanded', 'false'));
          li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
      // Highlight the link whose path matches the current page
      const a = li.querySelector('a');
      if (a) {
        const linkPath = new URL(a.href, window.location.href).pathname;
        if (currentPath === linkPath || (currentPath !== '/' && currentPath.startsWith(linkPath))) {
          li.setAttribute('aria-current', 'page');
        }
      }
    });
  }

  // ── Sign In trigger ──────────────────────────────────────────────────────
  // nav.html authors "Join Now" inside <strong> so decorateButtons gives it
  // class="button primary" (the cyan pill). "Sign In" is a plain anchor.
  // We find Sign In as the non-button anchor in nav-tools.
  const navTools = nav.querySelector('.nav-tools');
  const signInEl = navTools?.querySelector('a:not(.button)');
  if (signInEl) {
    signInEl.classList.add('nav-sign-in');

    // Optimistic: reflect whatever is in localStorage immediately
    updateAuthControl(signInEl, isAuthenticated());

    // Background token validation — silently sign out if token is expired/invalid
    if (isAuthenticated()) {
      validateAuth().then((valid) => {
        if (!valid) {
          clearAuth();
          updateAuthControl(signInEl, false);
          window.dispatchEvent(new CustomEvent('sb-auth-change', { detail: { authenticated: false } }));
        }
      });
    }

    // Intercept click: open modal when mounted, sign out when authenticated
    signInEl.addEventListener('click', (e) => {
      if (signInEl.dataset.authState === 'signed-in') {
        e.preventDefault();
        clearAuth();
        window.dispatchEvent(new CustomEvent('sb-auth-change', { detail: { authenticated: false } }));
        return;
      }
      // If the widget is mounted, open it; otherwise the link navigates to /login
      if (document.querySelector('sb-widget-login-modal')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('sb-login-open'));
      }
    });

    // Reflect auth changes from the modal or other tabs
    window.addEventListener('sb-auth-change', (e) => {
      updateAuthControl(signInEl, e.detail?.authenticated ?? false);
    });

    // Lazy-load the login widget (well after LCP — same philosophy as nextjs-widget)
    // Use requestIdleCallback when available so it never competes with LCP
    const loadWidget = () => loadLoginWidget();
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadWidget, { timeout: 3000 });
    } else {
      setTimeout(loadWidget, 1000);
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);

  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
