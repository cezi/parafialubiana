// Spike E0-6: wysyłka Web Push partiami przez Cloudflare Queues (plan Free) + pomiar CPU.
import { encryptPayload, importVapidKey, vapidAuthorization } from './webpush.ts';
import { PAGE, SW } from './page.ts';

interface Env {
  DB: D1Database;
  QUEUE: Queue<Msg>;
  MOCK: Fetcher;
  VAPID_PUBLIC: string;
  VAPID_SUBJECT: string;
  VAPID_PRIVATE_JWK: string;
  SPIKE_KEY: string;
}
type Msg = { campaign: number; ids: number[]; attempt: number };
type Sub = { id: number; endpoint: string; p256dh: string; auth: string };
type Result = { id: number; status: 'sent' | 'gone' | 'retry' | 'failed'; http: number };

const MAX_ATTEMPTS = 3;
const MOCK_HOST = 'mock.push.test';
const PUSH_HOSTS = [/\.googleapis\.com$/, /\.mozilla\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/];

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o, null, 1), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/') return new Response(PAGE, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (url.pathname === '/sw.js') return new Response(SW, { headers: { 'content-type': 'text/javascript' } });
    if (url.pathname === '/api/vapid') return json({ key: env.VAPID_PUBLIC });

    if (url.pathname === '/api/subscribe' && req.method === 'POST') {
      const s = (await req.json().catch(() => null)) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } } | null;
      const host = s?.endpoint ? new URL(s.endpoint).hostname : '';
      if (!s?.endpoint?.startsWith('https://') || !PUSH_HOSTS.some((r) => r.test(host)) || !s.keys?.p256dh || !s.keys?.auth)
        return json({ error: 'nieprawidłowa subskrypcja' }, 400);
      await env.DB.prepare(
        "INSERT INTO subs (endpoint, p256dh, auth, kind) VALUES (?, ?, ?, 'real') ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, active = 1",
      ).bind(s.endpoint, s.keys.p256dh, s.keys.auth).run();
      return json({ ok: true });
    }

    // --- endpointy administracyjne (spike): wymagają nagłówka x-spike-key ---
    if (req.headers.get('x-spike-key') !== env.SPIKE_KEY) return json({ error: 'forbidden' }, 403);

    if (url.pathname === '/api/run' && req.method === 'POST') {
      const batch = Math.min(Math.max(Number(url.searchParams.get('batch')) || 10, 1), 45);
      const kind = url.searchParams.get('kind') === 'real' ? 'real' : 'mock';
      const limit = Number(url.searchParams.get('n')) || 100000;
      const campaign = (await env.DB.prepare('INSERT INTO campaigns (batch, kind) VALUES (?, ?) RETURNING id').bind(batch, kind).first('id')) as number;
      const ids = (await env.DB.prepare('SELECT id FROM subs WHERE kind = ? AND active = 1 ORDER BY id LIMIT ?').bind(kind, limit).all<{ id: number }>()).results.map((r) => r.id);
      const messages = chunk(ids, batch).map((part) => ({ body: { campaign, ids: part, attempt: 1 } }));
      for (const part of chunk(messages, 100)) await env.QUEUE.sendBatch(part);
      return json({ campaign, kind, batch, subs: ids.length, messages: messages.length });
    }

    if (url.pathname === '/api/report') {
      const campaign = Number(url.searchParams.get('campaign'));
      const rows = (await env.DB.prepare('SELECT status, attempt, count(*) AS n FROM deliveries WHERE campaign = ? GROUP BY status, attempt ORDER BY status, attempt').bind(campaign).all()).results;
      const meta = await env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(campaign).first();
      return json({ meta, rows });
    }

    if (url.pathname === '/api/reset-mock' && req.method === 'POST') {
      await env.DB.prepare("UPDATE subs SET active = 1 WHERE kind = 'mock'").run();
      return json({ ok: true });
    }
    return json({ error: 'not found' }, 404);
  },

  async queue(batch: MessageBatch<Msg>, env: Env): Promise<void> {
    const vapidKey = await importVapidKey(env.VAPID_PRIVATE_JWK);
    const authByOrigin = new Map<string, Promise<string>>();
    const payload = new TextEncoder().encode(JSON.stringify({ title: 'Parafia Łubiana — test', body: 'Testowe powiadomienie (spike E0-6)', url: '/' }));

    for (const msg of batch.messages) {
      const { campaign, ids, attempt } = msg.body;
      const subs = (await env.DB.prepare('SELECT id, endpoint, p256dh, auth FROM subs WHERE active = 1 AND id IN (SELECT value FROM json_each(?))').bind(JSON.stringify(ids)).all<Sub>()).results;

      const results = await Promise.all(
        subs.map(async (s): Promise<Result> => {
          const origin = new URL(s.endpoint).origin;
          if (!authByOrigin.has(origin)) authByOrigin.set(origin, vapidAuthorization(origin, env.VAPID_SUBJECT, env.VAPID_PUBLIC, vapidKey));
          const body = await encryptPayload(payload, s.p256dh, s.auth);
          const req = new Request(s.endpoint, {
            method: 'POST',
            headers: { TTL: '86400', Urgency: 'normal', 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', Authorization: await authByOrigin.get(origin)! },
            body,
          });
          try {
            const res = new URL(s.endpoint).hostname === MOCK_HOST ? await env.MOCK.fetch(req) : await fetch(req);
            await res.arrayBuffer();
            const http = res.status;
            if (http >= 200 && http < 300) return { id: s.id, status: 'sent', http };
            if (http === 404 || http === 410) return { id: s.id, status: 'gone', http };
            if ((http === 429 || http >= 500) && attempt < MAX_ATTEMPTS) return { id: s.id, status: 'retry', http };
            return { id: s.id, status: 'failed', http };
          } catch {
            return { id: s.id, status: attempt < MAX_ATTEMPTS ? 'retry' : 'failed', http: 0 };
          }
        }),
      );

      // 2 zapytania D1 na partię niezależnie od jej wielkości (limit zapytań na wywołanie na planie Free).
      const rows = results.map((r) => ({ c: campaign, s: r.id, st: r.status, h: r.http, a: attempt }));
      const gone = results.filter((r) => r.status === 'gone').map((r) => r.id);
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO deliveries (campaign, sub_id, status, http, attempt)
           SELECT value->>'c', value->>'s', value->>'st', value->>'h', value->>'a' FROM json_each(?) WHERE true
           ON CONFLICT(campaign, sub_id) DO UPDATE SET status = excluded.status, http = excluded.http, attempt = excluded.attempt`,
        ).bind(JSON.stringify(rows)),
        env.DB.prepare('UPDATE subs SET active = 0 WHERE id IN (SELECT value FROM json_each(?))').bind(JSON.stringify(gone)),
      ]);

      const retry = results.filter((r) => r.status === 'retry').map((r) => r.id);
      if (retry.length) await env.QUEUE.send({ campaign, ids: retry, attempt: attempt + 1 }, { delaySeconds: 20 * attempt });
      msg.ack();
    }
  },
} satisfies ExportedHandler<Env, Msg>;
