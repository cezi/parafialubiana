// Generuje: klucze VAPID (.secrets/vapid.json) oraz 1700 fikcyjnych subskrypcji (.secrets/seed-mock.sql).
// Uruchom: node scripts/gen.mjs   (katalog .secrets/ jest w .gitignore spike'a)
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

const b64u = (buf) => Buffer.from(buf).toString('base64url');
mkdirSync('.secrets', { recursive: true });

if (!existsSync('.secrets/vapid.json')) {
  const { publicKey, privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const vapid = { publicKey: b64u(await crypto.subtle.exportKey('raw', publicKey)), privateJwk: JSON.stringify(await crypto.subtle.exportKey('jwk', privateKey)) };
  writeFileSync('.secrets/vapid.json', JSON.stringify(vapid, null, 1));
  console.log('VAPID public:', vapid.publicKey);
}

const N = Number(process.argv[2] || 1700);
const lines = ["DELETE FROM subs WHERE kind = 'mock';"];
for (let i = 1; i <= N; i++) {
  const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const p256dh = b64u(await crypto.subtle.exportKey('raw', kp.publicKey));
  const auth = b64u(crypto.getRandomValues(new Uint8Array(16)));
  lines.push(`INSERT INTO subs (endpoint, p256dh, auth, kind) VALUES ('https://mock.push.test/sub/${i}', '${p256dh}', '${auth}', 'mock');`);
}
writeFileSync('.secrets/seed-mock.sql', lines.join('\n') + '\n');
console.log(`seed: ${N} subskrypcji → .secrets/seed-mock.sql`);
