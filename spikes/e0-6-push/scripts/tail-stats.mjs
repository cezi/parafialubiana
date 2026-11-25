// Statystyki CPU z `wrangler tail --format json` (jedno zdarzenie JSON na wywołanie, wieloliniowe).
import { readFileSync } from 'node:fs';

const raw = readFileSync(process.argv[2], 'utf8');
// wrangler wypisuje obiekty JSON jeden po drugim (pretty-print) — rozdziel po nawiasach najwyższego poziomu.
const events = [];
let depth = 0, start = -1, inStr = false, esc = false;
for (let i = 0; i < raw.length; i++) {
  const ch = raw[i];
  if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
  if (ch === '"') inStr = true;
  else if (ch === '{') { if (depth++ === 0) start = i; }
  else if (ch === '}') { if (--depth === 0) { try { events.push(JSON.parse(raw.slice(start, i + 1))); } catch {} } }
}
const q = events.filter((e) => e.event && 'queue' in e.event || e.event?.queue);
const pick = (list) => list.map((e) => e.cpuTime).filter((x) => typeof x === 'number').sort((a, b) => a - b);
const pct = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))] : NaN);
const outcomes = {};
for (const e of q) outcomes[e.outcome] = (outcomes[e.outcome] || 0) + 1;
const cpu = pick(q);
const wall = q.map((e) => e.wallTime).filter((x) => typeof x === 'number').sort((a, b) => a - b);
console.log(`zdarzenia tail: ${events.length}, wywołania kolejki: ${q.length}, wyniki: ${JSON.stringify(outcomes)}`);
if (cpu.length) console.log(`CPU ms na wywołanie: mediana ${pct(cpu, 50)}, p90 ${pct(cpu, 90)}, p99 ${pct(cpu, 99)}, max ${cpu.at(-1)}`);
else console.log('Brak pola cpuTime w zdarzeniach tail. Klucze przykładowego zdarzenia:', Object.keys(q[0] || events[0] || {}).join(', '));
if (wall.length) console.log(`czas ściany ms: mediana ${pct(wall, 50)}, max ${wall.at(-1)}`);
