#!/usr/bin/env node
// Synchronizacja backlog/BACKLOG.md -> GitHub Issues (kierunek: lokalnie -> GitHub).
// Użycie:
//   node scripts/backlog-sync.mjs            # tworzy brakujące Issues, zgrywa statusy
//   node scripts/backlog-sync.mjs --setup    # dodatkowo tworzy etykiety i kamienie milowe
//   node scripts/backlog-sync.mjs --dry-run  # tylko pokazuje, co by zrobił
// Wymaga zalogowanego `gh` (gh auth status).

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BACKLOG = join(ROOT, 'backlog', 'BACKLOG.md');
const PLAN = join(ROOT, 'docs', 'PLAN_WDROZENIA.md');
const DECISIONS = join(ROOT, 'docs', 'DECYZJE.md');
const REPO = process.env.BACKLOG_REPO || 'cezi/parafialubiana';
const BLOB = `https://github.com/${REPO}/blob/main`;

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');

const LABELS = {
  decyzja: ['5319e7', 'Decyzja projektowa (docs/DECYZJE.md)'],
  infra: ['0e8a16', 'Repozytorium, CI/CD, Cloudflare, DNS'],
  cms: ['1d76db', 'Sveltia CMS i model treści'],
  frontend: ['fbca04', 'Widoki i komponenty Astro'],
  pwa: ['c5def5', 'Manifest, service worker, offline'],
  push: ['d93f0b', 'Web Push: Worker, D1, Queues'],
  migracja: ['bfd4f2', 'Migracja z WordPress'],
  'jakość': ['0052cc', 'Testy, dostępność, wydajność'],
  blokada: ['b60205', 'Zadanie zablokowane'],
};
const MILESTONES = ['Etap 0', 'Etap 1', 'Etap 2', 'Etap 3', 'Etap 4', 'Etap 5', 'Faza 2'];
const STATUSES = new Set(['todo', 'w toku', 'blokada', 'review', 'done']);

function gh(argv, input) {
  return execFileSync('gh', argv, { encoding: 'utf8', input, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
}
function run(desc, argv, input) {
  console.log(`${DRY ? '[dry] ' : ''}${desc}`);
  return DRY ? '' : gh(argv, input);
}

// --- parsowanie backlogu ---
const lines = readFileSync(BACKLOG, 'utf8').split(/\r?\n/);
const items = [];
let milestone = null;
lines.forEach((line, idx) => {
  const h = line.match(/^##\s+(.*)$/);
  if (h) {
    const m = h[1].match(/(Etap \d|Faza 2)/);
    milestone = m ? m[1] : null;
    return;
  }
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  if (cells.length !== 5 || !/^[DEF]\d*-\d+$/.test(cells[0])) return;
  const [id, title, labels, status, issue] = cells;
  if (!STATUSES.has(status)) throw new Error(`Nieznany status "${status}" w ${id}`);
  items.push({
    idx, id, title, status, milestone,
    labels: labels.split(',').map((s) => s.trim()).filter(Boolean),
    issue: issue ? Number(issue.replace('#', '')) : null,
  });
});

// --- treść Issue: kryterium z planu / decyzja z rejestru ---
const plan = readFileSync(PLAN, 'utf8');
const decisions = readFileSync(DECISIONS, 'utf8');
function bodyFor(it) {
  const out = [`Pozycja backlogu **${it.id}** · kamień milowy: ${it.milestone}`, ''];
  if (it.id.startsWith('D-')) {
    const sec = decisions.split(/\n(?=### )/).find((s) => s.startsWith(`### ${it.id}.`));
    const dec = sec?.match(/\*\*Decyzja[^\n]*/)?.[0];
    if (dec) out.push(dec, '');
    out.push(`Szczegóły, opcje i konsekwencje: [docs/DECYZJE.md](${BLOB}/docs/DECYZJE.md)`);
  } else {
    const row = plan.split('\n').find((l) => l.startsWith(`| ${it.id} |`));
    if (row) {
      const [, zad, kryt] = row.split('|').slice(1, -1).map((c) => c.trim());
      out.push(`**Zakres:** ${zad}`, '', `**Kryterium akceptacji:** ${kryt}`, '');
    }
    out.push(`Plan: [docs/PLAN_WDROZENIA.md](${BLOB}/docs/PLAN_WDROZENIA.md)`);
  }
  out.push('', `_Źródło prawdy: [backlog/BACKLOG.md](${BLOB}/backlog/BACKLOG.md) — zmiany statusu wprowadzaj lokalnie i synchronizuj skryptem._`);
  return out.join('\n');
}

// --- setup etykiet i kamieni milowych ---
if (args.has('--setup')) {
  for (const [name, [color, desc]] of Object.entries(LABELS)) {
    run(`etykieta: ${name}`, ['label', 'create', name, '--color', color, '--description', desc, '--force', '-R', REPO]);
  }
  const existing = DRY ? [] : JSON.parse(gh(['api', `repos/${REPO}/milestones?state=all&per_page=100`])).map((m) => m.title);
  for (const t of MILESTONES) {
    if (existing.includes(t)) continue;
    run(`kamień milowy: ${t}`, ['api', `repos/${REPO}/milestones`, '-f', `title=${t}`]);
  }
}

// --- synchronizacja ---
const remote = DRY ? [] : JSON.parse(gh(['issue', 'list', '-R', REPO, '--state', 'all', '--limit', '1000', '--json', 'number,state,title,labels']));
const byNumber = new Map(remote.map((i) => [i.number, i]));
const byPrefix = new Map(remote.map((i) => [i.title.match(/^\[([^\]]+)\]/)?.[1], i]));
let changed = false;

for (const it of items) {
  const labels = [...it.labels, ...(it.status === 'blokada' ? ['blokada'] : [])];
  let r = it.issue ? byNumber.get(it.issue) : byPrefix.get(it.id);
  if (!r && it.issue) console.warn(`! ${it.id}: Issue #${it.issue} nie istnieje w ${REPO}`);
  if (!r) {
    const out = run(`utwórz [${it.id}] ${it.title}`, ['issue', 'create', '-R', REPO, '--title', `[${it.id}] ${it.title}`,
      '--body-file', '-', '--milestone', it.milestone, ...labels.flatMap((l) => ['--label', l])], bodyFor(it));
    const num = Number(out.trim().split('/').pop());
    r = { number: num || null, state: 'OPEN', labels: labels.map((name) => ({ name })) };
  }
  if (r.number && it.issue !== r.number) {
    it.issue = r.number;
    changed = true;
  }
  if (!r.number) continue;
  const n = String(r.number);
  if (it.status === 'done' && r.state === 'OPEN') run(`zamknij #${n} [${it.id}]`, ['issue', 'close', n, '-R', REPO, '--reason', 'completed']);
  if (it.status !== 'done' && r.state === 'CLOSED') run(`otwórz ponownie #${n} [${it.id}]`, ['issue', 'reopen', n, '-R', REPO]);
  const hasBlock = r.labels.some((l) => l.name === 'blokada');
  if (it.status === 'blokada' && !hasBlock) run(`#${n}: +blokada`, ['issue', 'edit', n, '-R', REPO, '--add-label', 'blokada']);
  if (it.status !== 'blokada' && hasBlock) run(`#${n}: -blokada`, ['issue', 'edit', n, '-R', REPO, '--remove-label', 'blokada']);
}

// Issues bez odpowiednika w backlogu — tylko raport.
const ids = new Set(items.map((i) => i.id));
for (const r of remote) {
  const p = r.title.match(/^\[([^\]]+)\]/)?.[1];
  if (!p || !ids.has(p)) console.log(`? #${r.number} "${r.title}" — brak w backlogu (nie zmieniam)`);
}

// --- zapis numerów Issues do backlogu ---
if (changed && !DRY) {
  for (const it of items) {
    const cells = lines[it.idx].split('|');
    cells[5] = ` #${it.issue} `;
    lines[it.idx] = cells.join('|');
  }
  writeFileSync(BACKLOG, lines.join('\n'));
  console.log('Zapisano numery Issues w backlog/BACKLOG.md');
}
console.log(`Pozycji w backlogu: ${items.length}`);
