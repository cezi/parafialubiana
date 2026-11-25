// Eksport stron WordPress (parafialubiana.pl) do Markdown: migration/wp/pages/<slug>.md + migration/wp/manifest.json
// Uruchom: cd migration && npm i && npm run export-wp
import { mkdirSync, writeFileSync } from 'node:fs';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const SITE = 'https://parafialubiana.pl';
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*' });
td.use(gfm);
td.remove(['style', 'script', 'noscript']);

const pages = await (await fetch(`${SITE}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title,modified,content,menu_order`)).json();
mkdirSync('wp/pages', { recursive: true });
const manifest = [];
for (const p of pages) {
  const html = p.content.rendered;
  const md = td.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
  const title = td.turndown(p.title.rendered).trim();
  const links = [...new Set([...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]))];
  const files = links.filter((u) => /\/wp-content\/uploads\//.test(u));
  const external = links.filter((u) => /^https?:/.test(u) && !u.startsWith(SITE));
  writeFileSync(`wp/pages/${p.slug}.md`, `---\ntitle: ${JSON.stringify(title)}\nsource: ${p.link}\nmodified: ${p.modified}\n---\n\n${md}\n`);
  manifest.push({ slug: p.slug, title, source: p.link, modified: p.modified, chars: md.length, files, external });
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync('wp/manifest.json', JSON.stringify({ exported: new Date().toISOString(), site: SITE, pages: manifest }, null, 1) + '\n');
console.log(manifest.map((m) => `${m.slug.padEnd(36)} ${String(m.chars).padStart(6)} zn. · pliki ${m.files.length} · linki zewn. ${m.external.length}`).join('\n'));
