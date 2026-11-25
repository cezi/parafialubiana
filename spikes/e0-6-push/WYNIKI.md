# Spike E0-6 — Web Push z Cloudflare Workers + Queues (plan Free)

**Data:** 2026-11-25 · **Konto:** Cloudflare Free · **Worker:** `pl-push-spike.parafialubiana.workers.dev`

## Co zbudowano

- `src/webpush.ts` — szyfrowanie RFC 8291 (aes128gcm) i VAPID RFC 8292 (ES256) na samym WebCrypto, bez bibliotek.
  Poprawność potwierdzona testem `npm test`: wiadomości odszyfrowuje referencyjna biblioteka `http_ece`, podpis VAPID weryfikuje `node:crypto`.
- `src/index.ts` — producent (`/api/run`) dzieli subskrypcje na partie i wysyła je do kolejki; konsument kolejki szyfruje, wysyła, zapisuje wyniki do D1 (2 zapytania na partię), 404/410 → dezaktywacja subskrypcji, 429/5xx/błąd sieci → ponowienie z opóźnieniem (20 s, 40 s), maks. 3 próby.
- `mock/` — udawany serwer push (service binding): opóźnienie 20–100 ms, ~1% subskrypcji wygasłych (410), ~2% 429, ~1% 503.
- 1700 fikcyjnych subskrypcji z prawdziwymi kluczami P-256 w D1.

## Wyniki (1700 subskrypcji, jedna kampania)

| Partia | Wiadomości w kolejce | CPU na wywołanie (mediana / p90 / p99 / max) | Wynik wywołań | Dostarczone | Wygasłe (410) | Nieudane po 3 próbach | Czas całej wysyłki |
|---|---|---|---|---|---|---|---|
| 5 | 340 | 2 / 4 / 8 / **8 ms** | 100% ok | 1683 | 17 | 0 | 108 s |
| 10 | 170 | 6 / 8 / 11 / 11 ms | 100% ok | 1682 | 17 | 1 | 99 s |
| 20 | 85 | 7 / 11 / 15 / 15 ms | 100% ok | 1683 | 17 | 0 | 98 s |

- CPU z `wrangler tail` (pole `cpuTime`, zaokrąglone do 1 ms; tail próbkuje część wywołań: 52–130 zdarzeń na przebieg).
- Przy partiach 10 i 20 pojedyncze wywołania przekraczały 10 ms, ale Cloudflare **żadnego nie przerwał** (brak `exceededCpu`). Nie należy na tym polegać — limit może być egzekwowany ostrzej.
- Czas ściany ~0,5 s na partię (sieć nie liczy się do CPU). Całość ~100 s niezależnie od wielkości partii (kolejka przetwarza partie równolegle).
- Zużycie operacji Queues: ~1050 na kampanię przy partii 5 (zapis + odczyt + usunięcie + ponowienia). Limit Free: 10 000/dzień → zapas ~9×.
- D1: ~1700 wierszy zapisanych na kampanię (limit Free 100 000/dzień).

## Wnioski i decyzja D-05

1. **Plan Free wystarcza** dla 1700 subskrypcji i 1 kampanii dziennie. Przejście na Workers Paid (5 USD) **nie jest potrzebne**.
2. **Partia produkcyjna: 5 subskrypcji na wiadomość kolejki** (p99 = 8 ms, margines do limitu 10 ms). Przy wzroście do ~3500 subskrypcji nadal mieści się w limicie operacji.
3. Ponowienia działają: wszystkie błędy 429/503 udało się dostarczyć w 2.–3. próbie; wygasłe subskrypcje są wyłączane.
4. Do przeniesienia do produkcji (E4): `webpush.ts` bez zmian, zapis wyników przez `json_each` (uwaga: `INSERT … SELECT … ON CONFLICT` wymaga `WHERE true` — inaczej błąd składni SQLite), ponowienia z opóźnieniem, partia 5.

## Do zrobienia

- [ ] Test na prawdziwym urządzeniu (FCM / Mozilla / Apple): strona `https://pl-push-spike.parafialubiana.workers.dev` → „Włącz powiadomienia” → wysyłka `kind=real`.
- [ ] Po zakończeniu E0 — usunąć zasoby spike'a: Workery `pl-push-spike`, `pl-push-mock`, bazę `pl-push-spike-db`, kolejkę `pl-push-spike-q`.

## Uruchomienie

```
npm i && npm test                       # test kryptografii
node scripts/gen.mjs                    # klucze VAPID + 1700 fikcyjnych subskrypcji (.secrets/)
./scripts/run-test.sh <partia> [n]      # test obciążeniowy + statystyki CPU
```
Token Cloudflare z `../../.env` (`CLOUDFLARE_API_TOKEN`).
