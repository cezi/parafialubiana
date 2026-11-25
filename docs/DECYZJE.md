# Rejestr decyzji — Parafia Łubiana (PWA)

**Stan na:** 2026-11-19 · **Status ogólny:** decyzje zatwierdzone 2026-11-19 (D-02 — DNS odłożone)
**Powiązane:** [PLAN_WDROZENIA.md](PLAN_WDROZENIA.md), [PROJECT_BRIEF.md](PROJECT_BRIEF.md)

Każda decyzja ma: opcje, konsekwencje, rekomendację i miejsce na wybór. Po zatwierdzeniu wpisujemy wybór w polu **Decyzja**, a w backlogu i w GitHub Issues zamykamy zadanie z etykietą `decyzja`.

Legenda: ✅ zweryfikowane w dokumentacji/cenniku (XI 2026) · ⚠️ do weryfikacji przed zakupem lub wdrożeniem

---

## Część A — stack i infrastruktura

### D-01. Hosting strony (frontend PWA)

| | A. GitHub Pages (wg briefu) | B. Cloudflare Workers Static Assets |
|---|---|---|
| Koszt | 0 zł | 0 zł (Free) |
| Przekierowania 301 ze starych adresów WP | ❌ brak (tylko meta refresh / strona JS) | ✅ `_redirects` |
| Własne nagłówki (CSP, cache `sw.js`, `Service-Worker-Allowed`) | ❌ brak | ✅ `_headers` |
| API push pod tą samą domeną (`/api/*`, bez CORS) | ❌ osobna subdomena | ✅ ten sam Worker / route |
| Podgląd zmian przed publikacją (preview per branch) | ❌ | ✅ |
| Liczba dostawców do utrzymania | 2 (GitHub + Cloudflare) | 1 dla runtime (Cloudflare), GitHub = repo + CI |
| Zgodność z briefem | pełna | brief mówi „preferowany GitHub Pages” — zmiana wymaga Twojej zgody |

**Konsekwencje B:** zmiana w stosunku do briefu (warto poinformować zlecającego jednym zdaniem). Build nadal w GitHub Actions, publikacja `wrangler deploy`. Domena musi mieć DNS w Cloudflare (zob. D-02).
**Konsekwencje A:** brak 301 (ryzyko SEO przy zmianie adresów — łagodzone przez zachowanie starych slugów), osobna subdomena API (CORS), brak kontroli nagłówków bezpieczeństwa.

**Rekomendacja: B.** Jeden dostawca runtime, przekierowania, nagłówki, podglądy. Koszt bez zmian.
**Decyzja (2026-11-19): B — Cloudflare.** Podgląd jak `repo.github.io`: Worker dostaje stały adres `parafialubiana.<subdomena-konta>.workers.dev`, a każda wersja/gałąź może dostać własny adres podglądu (preview URL, np. `<gałąź>-parafialubiana.<subdomena>.workers.dev`). Konto Cloudflare na razie na wykonawcę — do przeniesienia na parafię przed odbiorem.

---

### D-02. Domena, DNS i los obecnej strony WordPress

Stan obecny ✅: `parafialubiana.pl` — WordPress (motyw Corporate Plus, PHP 8.3) na hostingu **webd.pl**, NS `ns5/ns7.webd.pl`, **rekord MX wskazuje na sam serwer webd.pl** (możliwe skrzynki pocztowe w domenie!).

Opcje:
- **A. Nowa aplikacja zastępuje WP pod `parafialubiana.pl`** — DNS do Cloudflare (Free), WP wyłączony po okresie przejściowym.
- **B. Aplikacja obok, np. `app.parafialubiana.pl`**, WP zostaje.

**Konsekwencje A:** trzeba ustalić, czy ktoś używa poczty `@parafialubiana.pl` (jeśli tak — przenieść rekordy MX/SPF lub przenieść pocztę; inaczej poczta przestanie działać). Hosting webd.pl można wypowiedzieć po migracji (oszczędność + koniec utrzymania WordPressa/PHP — mniejsze ryzyko włamań). Rejestracja domeny może zostać u obecnego rejestratora, zmieniamy tylko NS.
**Konsekwencje B:** dwie strony do utrzymania, rozjazd treści, parafianie nie wiedzą, która jest aktualna. Sprzeczne z celem „uporządkować”.

**Rekomendacja: A**, z wcześniejszym spisem rekordów DNS i potwierdzeniem u parafii, kto ma dostęp do panelu webd.pl i do rejestratora domeny.
**Decyzja (2026-11-19): A — domena przez Cloudflare, ale na razie nic nie robimy.** Do czasu przełączenia pracujemy na `*.workers.dev`. Poczta w domenie: do sprawdzenia przed E5-6.

---

### D-03. Wersja Astro i integracja PWA

✅ Astro 6 (marzec 2026) — Vite 7, wymaga Node 22+. ⚠️ Brak potwierdzonej oficjalnie zgodności `@vite-pwa/astro` z Astro 6.

Opcje:
- **A. Astro 6 + `@vite-pwa/astro`** (strategia `injectManifest` — i tak potrzebujemy własnego service workera do push).
- **B. Astro 6 + własny service worker** budowany Workboxem/esbuildem w małym skrypcie po buildzie (precache manifest generowany z `dist/`).
- **C. Astro 5** (starsza linia) dla pewnej zgodności wtyczki.

**Konsekwencje:** A — najmniej kodu, ryzyko blokady aktualizacji, jeśli wtyczka nie nadąży za Astro. B — ~1 dzień więcej pracy, pełna kontrola, zero zależności od wtyczki. C — dług technologiczny od pierwszego dnia, krótsze wsparcie.

**Rekomendacja:** spike (pół dnia) na A; jeśli peer deps/build nie przechodzą czysto → **B**. C odrzucić.
**Decyzja (2026-11-19): A — sprawdzone.** Aktualnie stabilne jest **Astro 7** (7.4.13, wymaga Node ≥ 22.23.4), nie Astro 6. `@vite-pwa/astro` 2.0.3 deklaruje zgodność z Astro 5/6/7 (Vite 8). Test: Astro 7.4.13 + `AstroPWAIntegration` (eksport nazwany — w v2 nie ma eksportu domyślnego) ze strategią `buildSW` i własnym `src/sw.ts` (precache Workbox + `push` + `notificationclick`) — build przechodzi, `sw.js` zawiera manifest precache i obsługę push. Wybór: **Astro 7 + @vite-pwa/astro 2 (buildSW)**.

---

### D-04. Logowanie do Sveltia CMS

✅ Oficjalny `sveltia-cms-auth` (Cloudflare Worker) działa z GitHub Pages i z Cloudflare. Autorzy **zalecają GitHub App** zamiast OAuth App i ustawienie `ALLOWED_DOMAINS`. Logowanie PKCE bez Workera jest obecnie tylko dla GitLab; dla GitHub alternatywą jest wklejanie tokenu dostępu.

Opcje:
- **A. `sveltia-cms-auth` + GitHub App**, redaktor loguje się przyciskiem „Zaloguj przez GitHub”.
- **B. Personal Access Token** wklejany przez redaktora w panelu.

**Konsekwencje A:** redaktor potrzebuje konta GitHub (z MFA) i roli *write* w repo; jeden mały Worker do utrzymania (darmowy). Jeśli GitHub wprowadzi PKCE dla GitHub — Worker można usunąć bez zmian dla redaktora.
**Konsekwencje B:** zero infrastruktury, ale osoba nietechniczna zarządza tokenem (wygasanie, wyciek, kopiowanie) — sprzeczne z „prostota + bezpieczeństwo”.

**Rekomendacja: A.** Panel pod `parafialubiana.pl/admin/`.
**Decyzja (2026-11-19): A.** Redaktor: do ustalenia (konto GitHub z MFA).

**Zmiana (2026-11-25): Sveltia CMS Additions** — nowe rozwiązanie polecane przez autorów Sveltii (MIT, nasz Cloudflare Free, Durable Object): redaktor (Ksiądz Proboszcz) loguje się **loginem i hasłem, bez konta GitHub**; commity podpisane imieniem osoby. Test E0-5 udany ([spikes/e0-5-cms/WYNIKI.md](../spikes/e0-5-cms/WYNIKI.md)). Ryzyka: brak MFA (w planach), bardzo nowe oprogramowanie. `sveltia-cms-auth` w odwodzie (przejście = 2 linie w `config.yml`). **Ostateczne potwierdzenie przed E5-8.**

---

### D-05. Wysyłka Web Push — plan Cloudflare (Free vs Paid)

✅ Fakty (Workers Free): 100 000 żądań/dzień, **10 ms CPU na wywołanie**, **50 zewnętrznych subrequestów na wywołanie**. ✅ Queues dostępne na Free od II 2026: 10 000 operacji/dzień, retencja 24 h. Workers Paid: 5 USD/mies., 10 000 subrequestów, CPU do 5 min.

Skala: 1700 subskrypcji × 1 kampania/dzień. Każde powiadomienie = szyfrowanie (ECDH + AES-GCM) + podpis VAPID + `fetch` do serwera push przeglądarki.

| | A. Free + Queues (partie) | B. Workers Paid 5 USD | C. GitHub Actions jako „wysyłacz” | D. OneSignal (gotowa usługa) |
|---|---|---|---|---|
| Koszt/mies. | 0 zł | ~21 zł | 0 zł | 0 zł (plan darmowy) ⚠️ |
| Złożoność | średnia (partie ~10 endpointów na wiadomość kolejki, retry) | niska–średnia (ten sam kod, większe partie) | średnia (Node `web-push`, sekret D1 API w Actions) | najniższa (bez D1/Workera do push) |
| Ryzyko | limit 10 ms CPU na partię — **trzeba zmierzyć** | minimalne | opóźnienia crona GitHub (5–30 min), zależność od Actions | dane subskrybentów u zewnętrznej firmy (USA), skrypty śledzące, RODO, branding |
| Zgodność z briefem | pełna | pełna | częściowa | sprzeczna (brief: D1 + Worker) |

**Rekomendacja: architektura A (kolejka + partie + retry + deduplikacja)** — ten sam kod działa na B. Start na Free, test obciążeniowy na 1700 fikcyjnych subskrypcji (własny serwer testowy push). Jeśli CPU na partię przekracza ~6 ms lub błędy 1102 → przełączenie na **B** (zmiana planu, nie kodu). D odrzucić (prywatność, brief).
**Decyzja (2026-11-19): A — Cloudflare Queues, trzeba zmierzyć** (E0-6). Paid tylko, jeśli pomiar pokaże przekroczenie limitu CPU.

**Wynik pomiaru (2026-11-25): plan Free wystarcza.** 1700 subskrypcji wysłanych w ~100 s; partia 5 subskrypcji na wiadomość kolejki: CPU p99 = 8 ms (limit 10 ms), ~1050 operacji Queues na kampanię (limit 10 000/dzień). Szczegóły: [spikes/e0-6-push/WYNIKI.md](../spikes/e0-6-push/WYNIKI.md).

---

### D-06. Synchronizacja harmonogramu wydarzeń/ogłoszeń → D1

Opcje:
- **A. Pull:** build Astro generuje publiczny plik `/push-schedule.json` (tylko kampanie: tytuł, treść, URL, czas UTC, klucz idempotencji). Cron Workera co 15 min pobiera go i robi `UPSERT` do D1.
- **B. Push:** krok GitHub Actions po deployu wysyła harmonogram do endpointu Workera (podpis HMAC).

**Konsekwencje A:** zero sekretów w CI, odporne na nieudane kroki CI (następny cron nadrobi), harmonogram jest jawny (to i tak publiczne treści). Opóźnienie do 15 min po publikacji.
**Konsekwencje B:** natychmiastowa synchronizacja, ale sekret w Actions, endpoint do zabezpieczenia, nieudane wywołanie = zgubiona aktualizacja (trzeba retry).

**Rekomendacja: A** (+ opcjonalnie B jako „szturchnięcie” przyspieszające — później).
Idempotencja: klucz `typ:slug:data:wariant` unikalny w D1; zmiana treści przed wysyłką = aktualizacja, po wysyłce = ignorowana.
**Decyzja (2026-11-19): A — pull.**

---

### D-07. Wysyłka ręczna i panel powiadomień

Brief wymaga podglądu i potwierdzenia wysyłki ręcznej oraz zabezpieczonego endpointu.

Opcje:
- **A. Wszystko z poziomu Sveltia:** pola w ogłoszeniu/wydarzeniu („Powiadom po publikacji”, „Przypomnienie: dzień wcześniej 19:00 / w dniu 9:00”). Podgląd = podgląd wpisu. Wysyłka po zapisaniu i synchronizacji (D-06). Osobny **panel tylko do odczytu** (raport sent/failed, anulowanie zaplanowanej kampanii) za Cloudflare Access.
- **B. Osobny panel z przyciskiem „Wyślij teraz”** (Cloudflare Access + weryfikacja JWT w Workerze), dowolny tekst.
- **C. A + B.**

**Konsekwencje A:** redaktor uczy się jednego narzędzia; nie da się wysłać „czegokolwiek” bez śladu w repo (historia w Git = audyt). Wysyłka „teraz” trwa do ~15–20 min (build + cron).
**Konsekwencje B/C:** drugie narzędzie i logowanie (Access: kod e-mail), więcej kodu i testów bezpieczeństwa; szybciej w sytuacjach pilnych (np. odwołana Msza).

**Rekomendacja: A w MVP**, panel raportów/anulowania za Access; przycisk „wyślij teraz” (B) jako opcja w gwarancji/fazie 2, jeśli redaktor zgłosi potrzebę.
**Decyzja (2026-11-19): A.**

---

### D-08. Reguły wysyłki push (domyślne)

Propozycja:
- maks. **1 kampania dziennie** na subskrybenta (egzekwowane w Workerze; druga tego dnia → przesunięcie na następny dzień albo scalenie, decyzja redaktora w panelu),
- **cisza nocna 21:00–7:00** (Europe/Warsaw) — wysyłki przesuwane na 7:30,
- nowe ogłoszenia: po publikacji (zwykle sobota),
- przypomnienia o wydarzeniach: domyślnie w dniu wydarzenia o 9:00 (opcja: dzień wcześniej o 19:00),
- kategorie subskrypcji (np. „ogłoszenia”, „wydarzenia”) — **nie w MVP** (prostota).

**Decyzja (2026-11-19): akceptuję.**

---

## Część B — zakres i treści

### D-09. Model treści: intencje i ogłoszenia

Audyt ✅: dziś ogłoszenia i intencje to **pojedyncze strony WP nadpisywane co tydzień** — nie ma archiwum do migracji.

Propozycja: **1 plik na tydzień** (ogłoszenia: niedziela + lista punktów; intencje: tydzień → dni → Msze → intencje). Redaktor wkleja/wpisuje cały tydzień naraz — tak jak robi to dziś. Archiwum buduje się samo od startu nowej strony.
Alternatywa: 1 wpis na Mszę — precyzyjne wyszukiwanie, ale ~10–15 formularzy tygodniowo dla redaktora.

**Rekomendacja: 1 plik na tydzień** + funkcja „Zduplikuj poprzedni tydzień” (Sveltia duplikuje wpis).
**Decyzja (2026-11-19): tak — 1 plik na tydzień.**

---

### D-10. Galeria archiwalna

Audyt ✅: 60 wpisów galerii (2008–2024), **1638 plików mediów, szacunkowo ~1,7 GB** oryginałów (ok. 1 MB/zdjęcie).

Opcje:
- **A. Nie migrować w MVP**; przed wyłączeniem WP — eksport do archiwum dla parafii (ZIP/dysk).
- **B. Migracja wybranych albumów** (np. 10–15) zoptymalizowanych (WebP ~1600 px, ~200 KB) do repo.
- **C. Pełna migracja** do Cloudflare R2 (Free 10 GB ⚠️), metadane albumów w repo.

**Konsekwencje:** zdjęcia w Git powiększają repo na zawsze (limit zalecany GitHub ~1 GB) i spowalniają CMS; B mieści się (~50–80 MB). C to dodatkowa usługa i skrypt migracji (~1–2 dni) — wykracza poza zakres wyceny 14 500 zł. Nowe galerie dodawane przez redaktora też trafiają do repo — trzeba limitu rozmiaru/kompresji przy uploadzie.

**Rekomendacja: A + B** (najnowsze/najważniejsze albumy wskaże parafia), C jako osobna wycena.
**Decyzja (2026-11-19): A — nie migrować w MVP.** Spis wpisów i ścieżek: [migracja/galeria-wp.md](migracja/galeria-wp.md).

**Decyzja uzupełniająca (2026-11-19): zdjęć z archiwum nie publikujemy wcale** (wizerunki dzieci bez pisemnych zgód rodziców — Standardy ochrony małoletnich diecezji pelplińskiej, Standard 4 pkt 16 lit. i). Parafia otrzymuje archiwum oryginałów w ZIP (poza repozytorium). Szczegóły: [migracja/zdjecia-kompresja.md](migracja/zdjecia-kompresja.md).

---

### D-11. Zmiany z ankiety zlecającego (1 odpowiedź, ocena 5/5)

| Uwaga | Propozycja | W MVP? |
|---|---|---|
| Kontakt (telefon komórkowy + e-mail) na **pierwszym ekranie mobilnym** — najważniejsza uwaga (powtórzona 3×) | Przyciski „Zadzwoń” / „Napisz” w pierwszym ekranie startowym + ikona telefonu w górnym pasku na każdej podstronie | ✅ tak |
| „Ochrona dzieci i młodzieży” na stronie głównej | Stały kafel/link na stronie głównej (też mobile) + stopka | ✅ tak |
| Biuletyn „Lubiano” do podglądu | Już w prototypie (PDF + okładka automatycznie) | ✅ tak |
| Link do wyszukiwarki grobów mogily.pl/lubiana | Już w prototypie (Nasz Cmentarz) | ✅ tak |
| Zakładka „Duszpasterze” pod „Parafia” z listą proboszczów (1983–2008, 2008–2025, od 2025) | Prosta kolekcja/strona | ✅ tak |
| **Nekrologi** | Nowy typ treści: imię i nazwisko, daty, termin i miejsce pogrzebu, opcjonalny push. Wymaga zasad (zgoda rodziny, czas publikacji, archiwizacja) | ☐ do decyzji |
| **Kronika parafii** | Nowy typ treści (wpisy z datą + zdjęcia) — blisko galerii (D-10) | ☐ do decyzji |

**Konsekwencje nekrologów/kroniki:** +1–2 dni każdy (schemat, CMS, widoki, testy); nekrologi to dane osób zmarłych i rodzin — potrzebna krótka zasada redakcyjna (np. publikacja za zgodą rodziny, zdjęcie z sieci usuwane po 30 dniach).
**Rekomendacja:** kontakt, ochrona dzieci, Duszpasterze, biuletyn, cmentarz — w MVP. **Nekrologi — w MVP, jeśli zlecający potwierdzi zasady** (to realna potrzeba i dobry powód do push). **Kronika — faza 2** (razem z galerią).
**Decyzja (2026-11-19): nekrologi i kronika parafii — robimy (MVP).** Zasady publikacji nekrologów do potwierdzenia z parafią. Uwaga: wykracza poza pierwotny zakres wyceny — ewentualny aneks.

---

### D-12. Wersja sklepowa (Google Play / App Store)

**Rekomendacja:** nie w pierwszym etapie (zgodnie z briefem). Najpierw PWA i pomiar, ilu parafian instaluje aplikację i włącza push. Google Play można później dodać tanio (TWA — opakowanie PWA, push działa przez Chrome); App Store wymaga natywnego push (APNs) — droższe.
**Decyzja (2026-11-19): tylko PWA.**

---

### D-13. Repozytorium publiczne i dane osobowe

✅ Repo `cezi/parafialubiana` jest **publiczne** i puste. Treści strony są publiczne, więc to w porządku, ale:
- plik `docs/Parafia Lubiana – wyniki konsultacji UI UX…csv` zawiera **prywatny adres e-mail** respondenta — **nie commitować** (proponuję `.gitignore` na `docs/private/` i przeniesienie tam pliku),
- prototyp (`prototype/`) zawiera prawdziwe intencje z nazwiskami — są i tak publikowane na stronie parafii, ale rozważ, czy prototyp trafia do repo (proponuję tak, jako materiał referencyjny, albo `prototype/` w `.gitignore`).

**Decyzja (2026-11-19): repo publiczne, CSV poza repo** (`docs/private/` w `.gitignore`).

---

## Część C — e-mail i SMS (propozycja dodatkowa)

### D-14. Newsletter e-mail i SMS — Brevo czy alternatywa

**Ważne konsekwencje niezależnie od dostawcy:**
1. E-mail i telefon to **dane osobowe parafian** — brief wyklucza je z MVP. Proponuję **fazę 2**. Potrzebne: formularz zapisu z podwójnym potwierdzeniem (double opt-in), łatwy wypis (link / „STOP”), aktualizacja polityki prywatności, umowa powierzenia z dostawcą; administratorem danych jest parafia (w Kościele katolickim w Polsce stosuje się Dekret ogólny KEP o ochronie osób fizycznych).
2. **Darmowego SMS w praktyce nie ma** — płaci się za każdą wiadomość. Przykład: 100 seniorów × 4 SMS/mies. ≈ 400 SMS ≈ **65–70 zł/mies.**; 300 osób × co tydzień ≈ 1300 SMS ≈ **210 zł/mies.** Dlatego SMS proponuję tylko dla osób bez smartfona i dla ważnych komunikatów, nie jako kopię każdego ogłoszenia.
3. Najlepiej, żeby kontakty trzymał dostawca (jego formularz i panel) — wtedy nie przechowujemy danych osobowych w naszym D1.

| Opcja | E-mail | SMS (Polska) | Plusy | Minusy |
|---|---|---|---|---|
| **1. Brevo (all-in-one)** | Free: **300 e-maili/dzień** ✅ (przy >300 subskrybentach cotygodniowy newsletter nie wyjdzie w 1 dzień); Starter od ~9 EUR/mies. ⚠️ | kredyty prepaid, pakiety po 100, nie wygasają ✅; **cena dla PL do sprawdzenia w kalkulatorze Brevo** ⚠️ | jeden panel dla redaktora, firma z UE (Francja), formularze i double opt-in w zestawie, API do automatyzacji | logo Brevo w darmowych mailach, limit dzienny, cena SMS prawdopodobnie wyższa niż u polskich bramek |
| **2. Brevo (e-mail) + SMSAPI (SMS)** | jak wyżej | **0,16–0,17 zł netto/SMS** prepaid, min. doładowanie 49 zł ✅; pole nadawcy np. „PARAFIA” | najtańszy zweryfikowany SMS, polska firma, faktura VAT PL | dwa panele, dwie umowy powierzenia |
| **3. MailerLite (e-mail) + SMSAPI** | Free ⚠️ (limit subskrybentów do sprawdzenia), RSS→e-mail w planie płatnym ⚠️ | jak wyżej | bardzo prosty edytor, firma z UE | dwa narzędzia, limity Free do weryfikacji |
| **4. Cloudflare Email Service + SMSAPI** | wymaga Workers Paid (5 USD) ✅; wysyłka do dowolnych odbiorców tylko na Paid ✅ | jak wyżej | najtańsze przy dużej skali, spójne z D-05=B | **kontakty w naszym D1** (dane osobowe u nas), własny formularz, wypis, bounce — dużo pracy |
| **5. Bramka SMS na telefonie Android** (aplikacja open source + karta SIM z nielimitowanymi SMS) | — | ~0 zł za SMS (abonament ~25–35 zł/mies.) | prawie darmowo, parafianie mogą odpisać | regulaminy operatorów zwykle zabraniają masowej wysyłki z kart prywatnych (ryzyko blokady), zależność od telefonu na plebanii, wolna wysyłka |
| OVHcloud SMS (porównawczo) | — | 0,135 zł netto/SMS (pakiet 200) ✅ | tanio | panel mniej przyjazny dla osoby nietechnicznej |

**Rekomendacja:**
- **Faza 2, po starcie PWA.** W MVP push wystarcza i jest darmowy.
- **E-mail: Brevo Free** (jeden prosty panel, formularz z double opt-in osadzony na stronie). Gdy lista przekroczy ~250 osób → Starter albo MailerLite.
- **SMS: SMSAPI** (najtańszy zweryfikowany, polska firma), chyba że kalkulator Brevo pokaże dla Polski ≤ ~0,20 zł — wtedy wszystko w Brevo dla prostoty.
- Integracja: ten sam harmonogram co push (D-06) może wywoływać kampanię e-mail Brevo przez API po publikacji ogłoszeń; SMS — ręcznie z panelu dostawcy lub dla wpisów oznaczonych „pilne”.
- Opcja 5 tylko świadomie, z akceptacją ryzyka blokady karty.

**Decyzja (2026-11-19): rezygnujemy z e-maili i SMS. Zostają tylko powiadomienia Web Push.**

---

## Podsumowanie rekomendacji (stan sprzed decyzji — wybory powyżej przy każdej decyzji)

| ID | Temat | Rekomendacja |
|---|---|---|
| D-01 | Hosting | Cloudflare Workers Static Assets (zamiast GH Pages) |
| D-02 | Domena | zastąpić WP, DNS → Cloudflare; najpierw sprawdzić pocztę w domenie |
| D-03 | Astro/PWA | Astro 6; spike `@vite-pwa/astro`, fallback własny SW |
| D-04 | Logowanie CMS | `sveltia-cms-auth` + GitHub App, redaktor z MFA |
| D-05 | Push | kolejka + partie na Free, test obciążeniowy, Paid 5 USD w razie potrzeby |
| D-06 | Synchronizacja | pull `/push-schedule.json` cronem co 15 min |
| D-07 | Wysyłka ręczna | z poziomu Sveltia + panel raportów za Cloudflare Access |
| D-08 | Reguły push | 1/dzień, cisza 21–7, przypomnienie 9:00 |
| D-09 | Intencje/ogłoszenia | 1 plik na tydzień |
| D-10 | Galeria | eksport dla parafii + wybrane albumy |
| D-11 | Ankieta | kontakt na 1. ekranie, ochrona dzieci, Duszpasterze — MVP; nekrologi — MVP po ustaleniu zasad; kronika — faza 2 |
| D-12 | Sklepy | nie w 1. etapie |
| D-13 | Repo | publiczne, CSV z e-mailem poza repo |
| D-14 | E-mail/SMS | faza 2: Brevo (e-mail) + SMSAPI (SMS) |

## Źródła (weryfikacja 2026-11-19)

- Cloudflare Workers — limity: https://developers.cloudflare.com/workers/platform/limits
- Subrequesty (zmiana II 2026): https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/
- Queues na planie Free: https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/
- Cloudflare Email Service — cennik: https://developers.cloudflare.com/email-service/platform/pricing/
- Sveltia CMS Auth: https://github.com/sveltia/sveltia-cms-auth
- Astro 6: https://astro.build/blog/astro-6 · https://docs.astro.build/en/guides/upgrade-to/v6/
- @vite-pwa/astro: https://github.com/vite-pwa/astro
- Brevo — SMS: https://help.brevo.com/hc/en-us/articles/208717449
- SMSAPI — cennik: https://www.smsapi.pl/cennik
- OVHcloud SMS — cennik: https://www.ovhcloud.com/pl/sms/prices/
