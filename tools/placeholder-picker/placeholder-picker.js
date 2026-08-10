/**
 * DA / Experience Workspace library plugin: browse and insert {{key}} placeholder tokens.
 * Uses the DA SDK for editor communication — works in both the classic DA editor
 * and the Experience Workspace library panel.
 * @see https://docs.da.live/developers/guides/developing-apps-and-plugins
 */
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const DEFAULT_ORG = 'znikolovski';
const DEFAULT_SITE = 'kynetic-trust';

function toClassName(name) {
  return name.toLowerCase()
    .replace(/[^0-9a-z]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBootstrap() {
  const el = document.getElementById('pp-bootstrap');
  try {
    return JSON.parse(el?.textContent?.trim() || '{}');
  } catch {
    return {};
  }
}

function getLiveOrigin(context) {
  const branch = context?.ref || context?.branch || 'main';
  const org = context?.org || DEFAULT_ORG;
  const site = context?.repo || context?.site || DEFAULT_SITE;
  return `https://${branch}--${site}--${org}.aem.live`;
}

function setStatus(message, isError = false) {
  const el = document.getElementById('pp-status');
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || '';
  el.classList.toggle('is-error', isError);
}

async function loadTokens(origin) {
  const res = await fetch(`${origin}/placeholders.json`);
  if (!res.ok) throw new Error(`Could not load placeholders (${res.status}).`);
  const { data } = await res.json();
  return data
    .filter((row) => row.Key)
    .map((row) => ({
      key: row.Key,
      value: row.Value ?? '',
      token: `{{${toClassName(row.Key)}}}`,
    }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { sensitivity: 'base' }));
}

function renderList(tokens, actions) {
  const list = document.getElementById('pp-list');
  const search = document.getElementById('pp-search');
  if (!list) return;

  const render = (filter = '') => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? tokens.filter((t) => t.key.toLowerCase().includes(q)
          || t.value.toLowerCase().includes(q)
          || t.token.includes(q))
      : tokens;

    list.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'pp-empty';
      empty.textContent = q
        ? 'No tokens match your search.'
        : 'No placeholders found. Run the sync action to populate the sheet.';
      list.append(empty);
      return;
    }

    filtered.forEach(({ token, key, value }) => {
      const li = document.createElement('li');
      li.className = 'pp-item';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<span class="pp-token">${escapeHtml(token)}</span>`
        + `<span class="pp-value">${escapeHtml(value || key)}</span>`;
      btn.addEventListener('click', async () => {
        if (actions?.sendText) {
          await actions.sendText(token);
        }
        actions?.closeLibrary?.();
      });
      li.append(btn);
      list.append(li);
    });
  };

  render();
  search?.addEventListener('input', () => render(search.value));
}

(async function init() {
  setStatus('Loading…');
  try {
    const { context, actions } = await DA_SDK;
    const bootstrap = getBootstrap();
    const origin = bootstrap.codeOrigin || getLiveOrigin(context);
    const tokens = await loadTokens(origin);
    setStatus(tokens.length ? `${tokens.length} token${tokens.length === 1 ? '' : 's'} available.` : '');
    renderList(tokens, actions);
  } catch (err) {
    setStatus(err.message || String(err), true);
  }
}());
