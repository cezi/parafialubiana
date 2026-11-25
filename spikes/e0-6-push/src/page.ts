// Minimalna strona do testu na prawdziwym urządzeniu: subskrypcja + odbiór powiadomienia.
export const PAGE = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test powiadomień — Parafia Łubiana</title>
<style>body{font:18px/1.5 system-ui,sans-serif;max-width:32rem;margin:2rem auto;padding:0 1rem;color:#2a2420;background:#fbf8f2}
button{font:inherit;padding:.8rem 1.2rem;border:0;border-radius:12px;background:#8a2e2a;color:#fff;cursor:pointer}#s{margin-top:1rem}</style></head>
<body><h1>Test powiadomień</h1><p>Strona testowa (spike E0-6). Kliknij, zezwól na powiadomienia i daj znać wykonawcy.</p>
<button id="b">Włącz powiadomienia</button><p id="s"></p>
<script>
const s = document.getElementById('s');
const b64 = (x) => Uint8Array.from(atob(x.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4 - x.length % 4) % 4)), c => c.charCodeAt(0));
document.getElementById('b').onclick = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Ta przeglądarka nie obsługuje Web Push (na iPhonie: najpierw „Do ekranu początkowego”).');
    const reg = await navigator.serviceWorker.register('/sw.js');
    if (await Notification.requestPermission() !== 'granted') throw new Error('Brak zgody na powiadomienia.');
    const { key } = await (await fetch('/api/vapid')).json();
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(key) });
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sub) });
    if (!r.ok) throw new Error('Serwer odrzucił subskrypcję: ' + r.status);
    s.textContent = '✓ Zapisano. Powiadomienie testowe przyjdzie po uruchomieniu wysyłki.';
  } catch (e) { s.textContent = '✗ ' + e.message; }
};
</script></body></html>`;

export const SW = `self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'Parafia Łubiana', { body: d.body, data: { url: d.url || '/' }, tag: 'test' }));
});
self.addEventListener('notificationclick', (e) => { e.notification.close(); e.waitUntil(clients.openWindow(e.notification.data.url)); });`;
