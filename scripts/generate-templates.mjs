/**
 * Generates mustache page templates from block builder configs.
 *
 * For each `template/**\/*.config.mjs` found, the script:
 *   1. Imports the config
 *   2. Imports each referenced block's `{block}.template.mjs` builder
 *   3. Calls build(data) to get the EDS input rows
 *   4. Assembles the full page HTML
 *   5. Writes (or checks) the sibling `.mustache` file
 *
 * Usage:
 *   node scripts/generate-templates.mjs          # regenerate all
 *   node scripts/generate-templates.mjs --check  # exit 1 if any file is stale (CI)
 *
 * Adding a new template:
 *   1. Create `template/{dir}/{name}.config.mjs`
 *   2. Run this script — the `.mustache` is generated automatically
 *
 * Updating a block's input contract:
 *   1. Update `blocks/{block}/{block}.js` (decorate)
 *   2. Update `blocks/{block}/{block}.template.mjs` (build) to match
 *   3. Run this script — all mustache files that use that block are regenerated
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');

// ─── HTML assembly helpers ────────────────────────────────────────────────────

function indent(str, spaces) {
  const pad = ' '.repeat(spaces);
  return str.split('\n').map((l) => (l.trim() ? pad + l : l)).join('\n');
}

function buildSection(section) {
  const lines = [];

  if (section.metadata) {
    // Metadata section — never rendered visually
    const rows = Object.entries(section.fields)
      .map(([key, val]) => `      <div>\n        <div>${key}</div>\n        <div>${val}</div>\n      </div>`)
      .join('\n');
    lines.push(`    <div class="metadata">\n${rows}\n    </div>`);
    return lines.join('\n');
  }

  const sectionClass = section.classes?.join(' ') ?? '';
  const openTag = sectionClass ? `<div class="${sectionClass}">` : '<div>';
  lines.push(`    ${openTag}`);

  // Default content (h2, p, etc.) that sits above the block in the section
  for (const html of section.defaultContent ?? []) {
    lines.push(`      ${html}`);
  }

  // Block rows from the builder
  if (section.block) {
    const builderPath = resolve(ROOT, 'blocks', section.block, `${section.block}.template.mjs`);
    if (!existsSync(builderPath)) {
      throw new Error(`Missing builder: ${builderPath}\nCreate blocks/${section.block}/${section.block}.template.mjs`);
    }
    // Dynamic import is async; we use a synchronous workaround by pre-collecting
    // builders at startup — see main() below.
    // The builder reference is attached to the section by main() before calling here.
    const rows = section._builder(section.data);
    const blockClass = [section.block, ...(section.blockClasses ?? [])].join(' ');
    lines.push(`      <div class="${blockClass}">`);
    for (const row of rows) {
      lines.push(indent(row, 8));
    }
    lines.push('      </div>');
  }

  lines.push('    </div>');
  return lines.join('\n');
}

function buildPage(config) {
  const sections = config.sections.map(buildSection).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${config.title}</title>
  </head>
<body>
  <header></header>
  <main>
${sections}
  </main>
  <footer></footer>
</body>
</html>
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const configPaths = globSync('template/**/*.config.mjs', { cwd: ROOT })
    .map((p) => resolve(ROOT, p));

  if (configPaths.length === 0) {
    process.stdout.write('No template configs found.\n');
    return;
  }

  let stale = 0;

  for (const configPath of configPaths) {
    const config = (await import(configPath)).default;

    // Attach builder functions to each section that references a block
    for (const section of config.sections) {
      if (!section.block) continue;
      const builderPath = resolve(ROOT, 'blocks', section.block, `${section.block}.template.mjs`);
      if (!existsSync(builderPath)) {
        throw new Error(`Missing builder: ${builderPath}`);
      }
      const mod = await import(builderPath);
      if (typeof mod.build !== 'function') {
        throw new Error(`${builderPath} must export a 'build' function`);
      }
      section._builder = mod.build;
    }

    const mustachePath = configPath.replace('.config.mjs', '.mustache');
    const generated = buildPage(config);

    if (CHECK) {
      if (!existsSync(mustachePath)) {
        process.stderr.write(`MISSING: ${mustachePath}\n`);
        stale += 1;
      } else {
        const existing = readFileSync(mustachePath, 'utf8');
        if (existing !== generated) {
          process.stderr.write(`STALE: ${mustachePath}\n`);
          stale += 1;
        }
      }
    } else {
      writeFileSync(mustachePath, generated, 'utf8');
      process.stdout.write(`Generated: ${mustachePath}\n`);
    }
  }

  if (CHECK) {
    if (stale > 0) {
      process.stderr.write(`\n${stale} template(s) are stale. Run: node scripts/generate-templates.mjs\n`);
      process.exit(1);
    } else {
      process.stdout.write('All templates are up to date.\n');
    }
  }
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
