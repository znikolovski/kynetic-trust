/**
 * AEM Edge Function — server-side placeholder resolution
 *
 * Intercepts HTML page responses at the CDN edge and replaces {{key}} tokens
 * with values from /placeholders.json before the document reaches the browser.
 * This makes placeholder values appear in the initial HTML (SEO-friendly, no
 * flash of unreplaced content) without requiring a client-side fetch.
 *
 * /placeholders.json is the standard EDS placeholders file, kept up to date
 * by .github/workflows/sync-rates.yml which pulls from the dashboard API.
 * No secrets are required here — /placeholders.json is public.
 *
 * The client-side decoratePlaceholders() in scripts/scripts.js remains as a
 * fallback for environments where this Edge Function is not active (local dev,
 * preview branches). Both mechanisms use the same {{key}} syntax and the same
 * /placeholders.json source so their output is identical.
 */

// Mirrors aem.js toClassName() so keys resolve identically on both sides.
function toClassName(name) {
  return name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default async function handler(request, context) {
  const response = await context.next();

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) return response;

  try {
    const url = new URL(request.url);
    const placeholdersRes = await fetch(`${url.origin}/placeholders.json`);
    if (!placeholdersRes.ok) return response;

    const { data } = await placeholdersRes.json();
    const map = Object.fromEntries(
      data
        .filter((row) => row.Key && row.Text)
        .map((row) => [toClassName(row.Key), row.Text]),
    );

    let html = await response.text();
    html = html.replace(/\{\{([\w-]+)\}\}/g, (m, key) => map[key] ?? m);

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return response;
  }
}
