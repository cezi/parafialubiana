# Plan wdrożenia — aplikacja PWA Parafii św. M. M. Kolbego w Łubianie

**Wersja:** 0.2 (decyzje zatwierdzone 2026-11-19) · **Data:** 2026-11-19
**Wejście:** [PROJECT_BRIEF.md](PROJECT_BRIEF.md), prototyp `prototype/`, ankieta UI/UX zlecającego, audyt parafialubiana.pl
**Decyzje:** [DECYZJE.md](DECYZJE.md) — zatwierdzone 2026-11-19: Cloudflare, Astro 7 + @vite-pwa/astro 2, Sveltia + GitHub App, Queues (do pomiaru), pull harmonogramu, wysyłka z Sveltia, bez migracji galerii, nekrologi i kronika w MVP, tylko PWA, bez e-mail/SMS.

---

## 1. Wnioski z materiałów

### 1.1 Audyt obecnej strony (19.11.2026)

- WordPress (motyw Corporate Plus, PHP 8.3) na hostingu webd.pl; DNS i **MX** w webd.pl.
- Menu (10 pozycji): Ogłoszenia (strona główna), Intencje mszalne, Nabożeństwa, Kancelaria, Duszpasterstwo, Grupy, Regulamin cmentarza, Ochrona dzieci i młodzieży, Historia parafii, Kontakt (slug `z-zycia-kosciola`).
- **Ogłoszenia i intencje to pojedyncze strony nadpisywane co tydzień** — brak archiwum, nic do migracji poza bieżącym tygodniem.
- 10 stron statycznych, 60 wpisów-galerii (2008–2024), 1638 plików mediów (~1,7 GB), 2 PDF-y.
- Brak polityki prywatności/RODO na stronie; strona „Ochrona dzieci” istnieje.

### 1.2 Prototyp

Wybrany kierunek „Tradycja”: EB Garamond + Instrument Sans, bordo `oklch(0.45 0.12 20)`, ciepłe tło `#efe8db`, zaokrąglone karty. Ekrany: Start, Ogłoszenia (+archiwum, udostępnij, drukuj), Intencje (widok tygodnia, „zauważyłeś błąd?”, ofiara za Mszę), Msze i nabożeństwa, Terminarz (miesiąc + szczegóły, „Dodaj do kalendarza”), Kancelaria i kontakt (mapa, konta, darowizna online, RODO), Duszpasterstwo i grupy, Historia (kalendarium, proboszczowie, opis kościoła), Nasz Cmentarz (godziny, opłaty, mogily.pl, regulamin), Biuletyn „Lubiano” (PDF, okładka automatyczna, numery), Ochrona dzieci (telefony, osoba odpowiedzialna, dokumenty), stopka, instrukcja instalacji (Android/iOS). Mobile: dolny pasek zakładek (Start · Ogłoszenia · Intencje · Terminarz · Parafia); desktop: górna nawigacja.

Prototyp **rozszerza zakres briefu** (biuletyn, cmentarz, darowizna online, RODO, grupy) — przyjmuję go jako zatwierdzony zakres UX.

### 1.3 Ankieta zlecającego (1 odpowiedź — decydent, wszystkie oceny 5/5)

Do wdrożenia: **kontakt telefoniczny i e-mail na pierwszym ekranie mobilnym** (najważniejsze), ochrona dzieci na stronie głównej, Duszpasterze z listą proboszczów pod „Parafia”. Do decyzji: nekrologi, kronika parafii (D-11). Biuletyn i link do mogily.pl są już w prototypie.

---

## 2. Architektura docelowa (wariant rekomendowany)

```
Redaktor ──► /admin (Sveltia CMS) ──OAuth──► Worker „cms-auth” ──► GitHub App
                    │ commit (Markdown/YAML)
                    ▼
            GitHub repo (main) ──► GitHub Actions: walidacja → astro build → wrangler deploy
                                                     │
                                                     ▼
          Cloudflare Worker „web” (static assets: strona + PWA + /push-schedule.json)
                    │  /api/push/*  (ten sam origin)
                    ▼
          Worker „push”: subscribe/unsubscribe · cron co 15 min (pull harmonogramu)
                    │            │
                    ▼            ▼
                  D1  ◄──── Queue „push-send” (partie ~10 subskrypcji, retry)
                                 │
                                 ▼
                 serwery push przeglądarek (FCM / Mozilla / Apple)
          Panel raportów /push-admin  ◄── Cloudflare Access (e-mail OTP) + weryfikacja JWT
```

**Zasady:**
- Git = źródło prawdy treści. D1 = tylko subskrypcje, kampanie, dostarczenia (brak danych osobowych parafian poza endpointem push).
- Czas: w treściach lokalny (`Europe/Warsaw`), w harmonogramie i D1 — UTC (konwersja przy buildzie, testy zmiany czasu).
- Zero sekretów we frontendzie. Sekrety: klucze VAPID i dane GitHub App w Cloudflare Secrets; token deploy w GitHub Actions Secrets.
- Stare adresy WP zachowane jako slugi nowych stron (`/intencje-mszalne/`, `/nabozenstwa/`, `/kancelaria-parafialna/` …) + `_redirects` dla reszty.

### 2.1 Struktura repozytorium (propozycja)

```
/
├─ apps/web/                  # Astro 7
│  ├─ src/content/            # treści edytowane w Sveltia
│  │  ├─ ogloszenia/2026-11-15.md
│  │  ├─ intencje/2026-11-16.yml        # tydzień od poniedziałku
│  │  ├─ wydarzenia/<slug>.md
│  │  ├─ biuletyn/<rok>-<nr>.md (+ PDF w public/uploads/biuletyn)
│  │  ├─ nekrologi/<data>-<slug>.md
│  │  ├─ kronika/<data>-<slug>.md
│  │  ├─ strony/<slug>.md               # historia, cmentarz, ochrona dzieci, RODO…
│  │  ├─ grupy/<slug>.md
│  │  └─ ustawienia/{parafia,msze,nabozenstwa,duszpasterze}.yml
│  ├─ src/content.config.ts   # schematy Zod
│  ├─ src/pages/ …            # widoki
│  ├─ src/sw/                 # service worker (precache + push + notificationclick)
│  └─ public/admin/{index.html,config.yml}
├─ workers/push/              # Worker API + cron + queue consumer, migracje D1
├─ workers/cms-auth/          # sveltia-cms-auth (fork/przypięta wersja)
├─ backlog/                   # lokalny backlog, synchronizowany z GitHub Issues
├─ docs/                      # brief, plan, decyzje, instrukcja redaktora, runbooki
└─ .github/workflows/         # ci.yml, deploy.yml, backlog-sync.yml (opcjonalnie)
```

### 2.2 Schematy treści (skrót)

| Kolekcja | Pola kluczowe | Uwagi |
|---|---|---|
| `ogloszenia` | `data` (niedziela), `tytul` (np. „XXXIII Niedziela Zwykła”), `punkty[]` (Markdown), `wyroznione`, `opublikowane`, `push.po_publikacji` | 1 plik/tydzień; archiwum automatyczne |
| `intencje` | `tydzien_od`, `dni[]: {data, swieto?, msze[]: {godzina, miejsce?, intencje[], uwaga?}}` | „Zduplikuj tydzień”; walidacja dat w tygodniu |
| `wydarzenia` | `tytul`, `start`, `koniec?`, `caly_dzien`, `miejsce`, `opis`, `grafika?`, `status` (planowane/odwołane), `cyklicznosc?` (brak / co tydzień / n-ty dzień miesiąca), `push.przypomnienie` (brak / dzień wcześniej 19:00 / w dniu 9:00) | ICS „Dodaj do kalendarza” generowany przy buildzie |
| `biuletyn` | `numer`, `data`, `pdf`, `spis_tresci[]`, `okladka?` | okładka z 1. strony PDF generowana w CI (poppler), jeśli brak |
| `nekrologi` | `imie_nazwisko`, `data_smierci`, `wiek?`, `pogrzeb: {data, godzina, miejsce}`, `push` | zasady publikacji (D-11) |
| `kronika` | `tytul`, `data`, `tresc`, `zdjecia[]` (limit rozmiaru, kompresja) | wpisy z życia parafii; zastępuje dawną „galerię” dla nowych treści |
| `strony`, `grupy` | `tytul`, `slug`, `tresc`, `dokumenty[]` | |
| `ustawienia` | kontakt, konta bankowe, godziny Mszy, kancelaria, proboszczowie, linki (mogily.pl, darowizna) | jedno miejsce dla danych z nagłówka/stopki |

### 2.3 Model D1 (rozwinięcie briefu)

- `push_subscriptions` — `id`, `endpoint` UNIQUE, `p256dh`, `auth`, `ua_family` (opcjonalnie, bez pełnego UA), `created_at`, `updated_at`, `active`, `fail_count`, `last_error_at`.
- `push_campaigns` — `id`, `idempotency_key` UNIQUE, `source` (ogloszenie/wydarzenie/nekrolog/ręczna), `ref_slug`, `title`, `body`, `url`, `scheduled_at_utc`, `status` (scheduled/sending/sent/cancelled/failed), `totals_json`, `created_at`, `sent_at`.
- `push_deliveries` — `campaign_id`, `subscription_id`, `status`, `attempts`, `http_status`, `updated_at`; PK (campaign_id, subscription_id) = deduplikacja.
- Retencja: dostarczenia 90 dni, subskrypcje nieaktywne usuwane po 30 dniach od 404/410. Backup: cotygodniowy `wrangler d1 export` w GitHub Actions do artefaktu (prywatnego) — bez danych osobowych poza endpointami.
- Ochrona: rate-limit na `/api/push/subscribe` (Cloudflare WAF Free / prosty licznik), walidacja endpointu (tylko znane domeny usług push), limit rozmiaru żądania.

---

## 3. Etapy i harmonogram (4–6 tygodni od zatwierdzenia)

Szacunek pracy: ~23–28 dni roboczych łącznie z testami i szkoleniem; bufor na decyzje zlecającego i dostęp do kont.

### Etap 0 — Przygotowanie i spike'i (2–3 dni)

| ID | Zadanie | Kryterium akceptacji |
|---|---|---|
| E0-1 | Decyzje D-01…D-14 zatwierdzone; zapis w `DECYZJE.md` | wszystkie pola „Decyzja” wypełnione |
| E0-2 | Repo: `git init`, `.gitignore` (w tym `docs/private/`), README, licencja, ochrona `main`, etykiety i kamienie milowe w GitHub | pierwszy push, CSV z e-mailem poza repo |
| E0-3 | Dostępy: konto Cloudflare (parafii lub wykonawcy — **ustalić właściciela**), panel webd.pl, rejestrator domeny, konto GitHub redaktora z MFA | lista dostępów w sejfie haseł |
| E0-4 | Spike Astro 7 + PWA — **wykonany 2026-11-19** (build OK, `buildSW`) | instalacja PWA lokalnie w E3 |
| E0-5 | Spike Sveltia + `sveltia-cms-auth` (GitHub App) na `*.workers.dev` | logowanie, zapis testowego wpisu, commit w repo |
| E0-6 | Spike push: szyfrowanie Web Push w Workerze + pomiar CPU na partię | raport: ms CPU / powiadomienie; decyzja Free/Paid (D-05) |
| E0-7 | Pełna inwentaryzacja treści WP (eksport REST API do `migration/`) + lista brakujących materiałów od parafii | lista „do przekazania przez parafię” wysłana |

### Etap 1 — Fundament i system wizualny (4–5 dni)

| ID | Zadanie | Kryterium akceptacji |
|---|---|---|
| E1-1 | Projekt Astro, TypeScript, ESLint/Prettier, Vitest, Playwright; CI na PR (lint, typy, testy, build) | zielony CI na PR |
| E1-2 | Tokeny z prototypu (kolory, typografia, promienie, odstępy) jako CSS custom properties; **fonty self-hosted** (bez Google Fonts — RODO) | kontrast WCAG AA dla wszystkich par kolorów |
| E1-3 | Layout: nagłówek, dolny pasek zakładek (mobile), górna nawigacja (desktop), stopka; **pasek z telefonem/e-mailem na 1. ekranie mobile** | uwaga z ankiety spełniona na 360×640 |
| E1-4 | Komponenty: karta, lista dni, karta Mszy, karta wydarzenia, przyciski akcji (zadzwoń, napisz, trasa, udostępnij, drukuj, dodaj do kalendarza) | Storybook-lite / strona `/_komponenty` (tylko dev) |
| E1-5 | Deploy na Cloudflare (`*.workers.dev`), `_headers` (CSP, HSTS, cache), `_redirects` | strona testowa dostępna, nagłówki bezpieczeństwa A w securityheaders |

### Etap 2 — Treści i CMS (5–6 dni)

| ID | Zadanie | Kryterium akceptacji |
|---|---|---|
| E2-1 | Schematy Content Collections + walidacja w CI | błędny wpis = czerwony CI z czytelnym komunikatem |
| E2-2 | Konfiguracja Sveltia: kolekcje, pola po polsku, podpowiedzi, wartości domyślne, podgląd, media (limit rozmiaru) | redaktor dodaje ogłoszenia tygodnia w < 10 min |
| E2-3 | Widoki: Start, Ogłoszenia (+archiwum, druk), Intencje (tydzień, nawigacja tygodni), Msze i nabożeństwa | zgodność z prototypem |
| E2-4 | Terminarz: lista + miesiąc, szczegóły, cykliczność, ICS, status „odwołane” | testy dat (DST, cykliczność „II niedziela miesiąca”) |
| E2-5 | Parafia: kancelaria i kontakt (mapa statyczna bez śledzenia), Duszpasterze + proboszczowie, grupy, historia, cmentarz, biuletyn (okładka z PDF), ochrona dzieci, RODO/polityka prywatności | wszystkie strony z menu prototypu |
| E2-6 | Nekrologi (zasady publikacji z parafią) | lista + szczegóły, opcjonalny push, archiwizacja |
| E2-9 | Kronika parafii (wpisy + zdjęcia) | redaktor dodaje wpis ze zdjęciami; zdjęcia kompresowane |
| E2-7 | Migracja treści z WP: 10 stron, bieżący tydzień ogłoszeń/intencji, PDF-y; galerii nie migrujemy (D-10) — eksport `wp-content/uploads` dla parafii przed wyłączeniem WP, spis: [migracja/galeria-wp.md](migracja/galeria-wp.md) | porównanie stron 1:1 zaakceptowane przez parafię |
| E2-8 | SEO: meta, Open Graph, `sitemap.xml`, `robots.txt`, dane strukturalne `Church`/`Event`, kanoniczne URL-e | Lighthouse SEO ≥ 95 |

### Etap 3 — PWA (2–3 dni)

| ID | Zadanie | Kryterium akceptacji |
|---|---|---|
| E3-1 | Manifest, ikony (maskable, Apple touch), kolory, `scope`, `start_url`, skróty (Ogłoszenia, Intencje) | instalacja Android/Chrome, Edge desktop, iOS „Do ekranu początkowego” |
| E3-2 | Service worker: precache powłoki, cache treści (network-first dla ogłoszeń/intencji, stale-while-revalidate dla stron), strona offline | ostatnio oglądane ogłoszenia i intencje dostępne offline |
| E3-3 | Baner instalacji (Chrome `beforeinstallprompt`) + instrukcja dla iOS; nie natrętny (zamykany, pamiętany) | zgodne z prototypem |
| E3-4 | Aktualizacje SW: komunikat „Dostępna nowa wersja” | brak „zawieszonych” starych wersji |

### Etap 4 — Web Push (5–6 dni)

| ID | Zadanie | Kryterium akceptacji |
|---|---|---|
| E4-1 | D1: migracje, indeksy, retencja; Worker `push` z `wrangler.toml` (D1, Queue, cron, secrets) | migracje odtwarzalne lokalnie i na prod |
| E4-2 | API: `POST /api/push/subscribe`, `POST /api/push/unsubscribe`, walidacja, rate-limit, CORS = tylko własny origin | testy integracyjne (Miniflare) |
| E4-3 | Frontend: przycisk „Włącz powiadomienia” (zgoda tylko po kliknięciu), stan włączone/wyłączone, obsługa iOS (tylko po instalacji) | Android, desktop, iOS 16.4+ |
| E4-4 | Build: `/push-schedule.json` z ogłoszeń/wydarzeń/nekrologów (UTC, klucz idempotencji, reguły D-08) | testy jednostkowe reguł (cisza nocna, 1/dzień, DST) |
| E4-5 | Cron: pull harmonogramu → UPSERT kampanii → podział na partie → Queue | brak podwójnych kampanii przy wielokrotnym pullu |
| E4-6 | Konsument kolejki: szyfrowanie, VAPID, wysyłka, 404/410 → dezaktywacja, 429/5xx → retry z backoff, zapis dostarczeń | test na 1700 fikcyjnych subskrypcji: 100% obsłużonych, 0 duplikatów |
| E4-7 | SW: `push` → powiadomienie (ikona, badge, tag), `notificationclick` → właściwa podstrona | klik otwiera wpis, także przy zamkniętej aplikacji |
| E4-8 | Panel `/push-admin` za Cloudflare Access: lista kampanii, raport sent/failed, anuluj zaplanowaną | JWT Access weryfikowany w Workerze; bez Access → 403 |

### Etap 5 — Jakość, migracja domeny, odbiór (4–5 dni)

| ID | Zadanie | Kryterium akceptacji |
|---|---|---|
| E5-1 | Dostępność: WCAG 2.2 AA (klawiatura, kontrasty, etykiety, powiększenie 200%), czytelność dla seniorów (min. 18 px treści) | audyt axe = 0 błędów krytycznych |
| E5-2 | Wydajność: Lighthouse mobile ≥ 90, LCP < 2,5 s na 4G, waga strony startowej < 300 KB | raport w PR |
| E5-3 | Testy E2E (Playwright): nawigacja, CMS → build, offline, instalacja, subskrypcja push (Chromium) | CI zielone |
| E5-4 | Testy ręczne na urządzeniach: Android (Chrome), iPhone (Safari, PWA), desktop (Chrome/Edge/Firefox/Safari) | lista kontrolna podpisana |
| E5-5 | Polityka prywatności (push, Cloudflare, brak cookies śledzących), klauzula RODO z obecnej strony | akceptacja parafii |
| E5-6 | Migracja domeny: spis rekordów DNS webd.pl (w tym MX/SPF!), przeniesienie NS do Cloudflare, `_redirects` starych URL-i, okres równoległy | stare linki → 301, poczta działa |
| E5-7 | Monitoring: Cloudflare Analytics (bez cookies), alert e-mail przy błędach crona/kampanii; backup D1 | runbook „co zrobić, gdy…” |
| E5-8 | Szkolenie redaktora (1–1,5 h) + **instrukcja redaktora** z zrzutami ekranu (dodaj ogłoszenia, intencje, wydarzenie z przypomnieniem, biuletyn) | redaktor samodzielnie publikuje tydzień |
| E5-9 | Odbiór: protokół, przekazanie dostępów, start gwarancji 12 mies. | protokół podpisany |

### Faza 2 (po odbiorze, osobna wycena)

Pełna galeria archiwalna (R2), przycisk „wyślij teraz”, kategorie powiadomień. Odrzucone 2026-11-19: e-mail/SMS (D-14), wersje sklepowe (D-12).

### Harmonogram orientacyjny

| Tydzień | Zakres |
|---|---|
| 1 | Etap 0 + start Etapu 1 |
| 2 | Etap 1 + start Etapu 2 (schematy, CMS) |
| 3 | Etap 2 (widoki, migracja) |
| 4 | Etap 3 + Etap 4 |
| 5 | Etap 4 (testy obciążeniowe) + Etap 5 |
| 6 | bufor: poprawki po testach parafii, przełączenie domeny, szkolenie, odbiór |

**Ścieżka krytyczna:** dostępy (Cloudflare, domena, konto GitHub redaktora) i materiały od parafii (osoba odpowiedzialna za ochronę dzieci, dokumenty, opisy grup, zdjęcia, archiwalne numery „Lubiano”).

---

## 4. Plan testów (skrót)

| Obszar | Jak |
|---|---|
| Schematy treści | Vitest + `astro check` w CI; fixtures z błędami |
| Logika dat | testy jednostkowe: zmiana czasu (ostatnia niedziela marca/października), cykliczność, cisza nocna, limit 1/dzień |
| Build i linki | build w CI + sprawdzanie linków (lychee) |
| CMS | ręcznie: każdy formularz Sveltia, upload PDF/zdjęcia, duplikacja tygodnia |
| PWA | Lighthouse PWA, instalacja na urządzeniach, tryb samolotowy |
| Push | Miniflare (API), lokalny serwer push-mock (1700 subskrypcji, losowe 404/410/429/500), idempotencja (pull ×3), test na prawdziwych urządzeniach |
| Bezpieczeństwo | brak sekretów w `dist/` (skan w CI), CSP, Access na panelu, rate-limit, `npm audit` |
| Dostępność/wydajność | axe, Lighthouse CI (budżety), test z czytnikiem ekranu (TalkBack/VoiceOver — podstawowy) |

## 5. Ryzyka

| Ryzyko | Wpływ | Działanie |
|---|---|---|
| Limit 10 ms CPU (Free) przy szyfrowaniu push | wysyłka niepełna | partie + pomiar w E0-6; Paid 5 USD (D-05) |
| iOS: push tylko po instalacji PWA, część osób nie zainstaluje | mniejszy zasięg (bez e-mail/SMS — D-14) | czytelna instrukcja instalacji, plakat/ogłoszenie z kodem QR w kościele |
| Poczta w domenie przestanie działać po zmianie NS | wysoki | spis DNS przed migracją, test MX (E5-6) |
| `@vite-pwa/astro` 2.x — świeża wersja (API zmienione, eksport nazwany) | opóźnienie 1 dzień | przypięte wersje; fallback: własny SW (D-03) |
| Redaktor bez konta GitHub / bez MFA | brak publikacji | założenie konta w E0-3, szkolenie |
| Brak materiałów od parafii | opóźnienie odbioru | lista w E0-7, strony z oznaczeniem „do uzupełnienia” nie blokują startu |
| Rozrost zakresu (nekrologi i kronika w MVP) | budżet 14 500 zł | ustalić z parafią aneks lub kompensatę zakresu |
| Repo publiczne — przypadkowy commit danych | RODO | `.gitignore`, skan sekretów, CSV poza repo |
| Konto Cloudflare na wykonawcy (decyzja 2026-11-19) | uzależnienie parafii | przeniesienie/dodanie parafii jako właściciela przed odbiorem (E5-9) |

## 6. Koszty stałe (szacunek miesięczny)

| Pozycja | Wariant minimalny | Wariant „spokojny” |
|---|---|---|
| Cloudflare (hosting, Workers, D1, Queues) | 0 zł | ~21 zł (Workers Paid 5 USD) |
| GitHub (repo publiczne, Actions) | 0 zł | 0 zł |
| Domena `.pl` | wg obecnego rejestratora | jw. |
| Hosting webd.pl | **do wypowiedzenia** po migracji | — |

## 7. Backlog i synchronizacja z GitHub Issues

Zob. [backlog/README.md](../backlog/README.md). Zadania z tabel powyżej (E0-1 … E5-9) oraz decyzje (D-01 … D-14) stają się pozycjami backlogu i Issues w GitHub z kamieniami milowymi `Etap 0` … `Etap 5`, `Faza 2`.
