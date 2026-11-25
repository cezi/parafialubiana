// Weryfikacja szyfrowania i VAPID niezależną implementacją referencyjną (http_ece, autor RFC 8188) i node:crypto.
// Uruchom: node test/crypto.test.mjs
import assert from 'node:assert/strict';
import { createECDH, randomBytes, createPublicKey, verify } from 'node:crypto';
import ece from 'http_ece';
import { encryptPayload, importVapidKey, vapidAuthorization, b64uToBytes, bytesToB64u } from '../src/webpush.ts';

// 1. Szyfrowanie: przeglądarka (odbiorca) = ECDH P-256 + 16-bajtowy sekret auth.
for (const text of ['Parafia Łubiana — test ąęśćżź', 'x'.repeat(3000)]) {
  const ua = createECDH('prime256v1');
  ua.generateKeys();
  const auth = randomBytes(16);
  const body = await encryptPayload(new TextEncoder().encode(text), bytesToB64u(ua.getPublicKey()), bytesToB64u(auth));
  const plain = ece.decrypt(Buffer.from(body), { version: 'aes128gcm', privateKey: ua, authSecret: auth });
  assert.equal(plain.toString('utf8'), text);
}
console.log('✓ szyfrowanie aes128gcm odszyfrowane przez http_ece');

// 2. VAPID: podpis JWT weryfikowany kluczem publicznym przez node:crypto.
const { publicKey, privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const jwk = JSON.stringify(await crypto.subtle.exportKey('jwk', privateKey));
const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', publicKey));
const header = await vapidAuthorization('https://fcm.googleapis.com', 'https://github.com/cezi/parafialubiana', bytesToB64u(pubRaw), await importVapidKey(jwk));
const [, token, k] = header.match(/^vapid t=([^,]+), k=(.+)$/);
assert.equal(k, bytesToB64u(pubRaw));
const [h, c, s] = token.split('.');
const claims = JSON.parse(Buffer.from(b64uToBytes(c)).toString());
assert.equal(claims.aud, 'https://fcm.googleapis.com');
assert.ok(claims.exp > Date.now() / 1000 && claims.exp <= Date.now() / 1000 + 24 * 3600, 'exp ≤ 24 h (wymóg RFC 8292)');
const pubKeyObj = createPublicKey({ key: await crypto.subtle.exportKey('jwk', publicKey), format: 'jwk' });
assert.ok(verify('sha256', Buffer.from(`${h}.${c}`), { key: pubKeyObj, dsaEncoding: 'ieee-p1363' }, Buffer.from(b64uToBytes(s))));
console.log('✓ podpis VAPID ES256 poprawny');
