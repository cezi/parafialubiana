# PROJECT_BRIEF — aplikacja parafialna Lubiana

**Status:** dokument wejściowy do planowania w Claude Code.  
**Data:** 2026-11-06  
**Źródło treści:** ustalenia z rozmowy z inwestorem; obecna witryna: https://parafialubiana.pl/  
**Uwaga:** przed migracją Claude Code powinien przeprowadzić aktualny audyt witryny. Lista sekcji poniżej pochodzi z ustaleń, nie jest pełnym, zweryfikowanym spisem aktualnej strony.

## 1. Cel projektu

Zbudować nowoczesną, szybką, responsywną stronę internetową parafii rzymskokatolickiej z funkcjonalnością PWA, instalowaną z przeglądarki na urządzeniach mobilnych. Zachować i uporządkować funkcjonalności obecnej strony oraz dodać **terminarz wydarzeń** i **powiadomienia Web Push**. Administracja treściami przez **jedną osobę** bez konieczności programowania.

Zakładana społeczność: maksymalnie około **1700 parafian**. Przy projektowaniu powiadomień przyjąć do około **1700 aktywnych subskrypcji** (liczba urządzeń może być większa niż liczba osób) i **nie więcej niż jedną kampanię push dziennie** na start. Zakładany wolumen: około 51 000 dostarczeń do endpointów miesięcznie, jeśli 1700 urządzeń jest aktywnych przez 30 dni.

## 2. Zatwierdzony stack

- **Astro** — frontend, routing, statyczne generowanie stron i kolekcje treści.
- **Sveltia CMS** — panel redakcyjny Git-based; wybór ostateczny, **nie zastępować Decap, Directus ani własnym CMS** bez uzgodnienia.
- **Astro Content Collections** — schematy i walidacja treści (Markdown/MDX/YAML/JSON według potrzeb).
- **PWA** — manifest, service worker, instalacja, podstawowa obsługa offline; integracja np. `@vite-pwa/astro` po weryfikacji kompatybilności z bieżącą wersją Astro.
- **GitHub** — repozytorium i historia treści; GitHub Actions do budowy i publikacji.
- **GitHub Pages** — preferowany hosting statycznej strony/PWA.
- **Cloudflare Workers** — API zapisu subskrypcji i wysyłki Web Push, harmonogram Cron, ewentualne endpointy administracyjne.
- **Cloudflare D1** — subskrypcje push, kampanie, logi i deduplikacja wysyłek. Nie jest głównym magazynem treści CMS.
- **Cloudflare DNS / domena** — konfiguracja domeny i HTTPS według stanu projektu.

**Cel kosztowy:** możliwie utrzymać hosting, Workers i D1 w darmowych limitach. Limity oraz ograniczenia Web Push i wykonania Workers zweryfikować przed implementacją; darmowy plan nie jest gwarancją zerowych kosztów przy każdym obciążeniu.

## 3. Funkcje publiczne — zakres bazowy

1. **Strona główna** — najważniejsze informacje, najnowsze ogłoszenia, nadchodzące wydarzenia, szybkie linki.
2. **Ogłoszenia parafialne** — aktualne ogłoszenia, archiwum, datowanie, czytelny widok mobilny.
3. **Intencje mszalne** — przegląd według dnia i godziny, archiwum lub widok tygodniowy (do uzgodnienia).
4. **Msze i nabożeństwa** — stałe godziny i dodatkowe nabożeństwa.
5. **Terminarz wydarzeń** — kalendarz i lista nadchodzących wydarzeń, szczegóły, daty/godziny, lokalizacja, opcjonalnie cykliczność.
6. **Informacje o parafii** — historia, duszpasterze, grupy/wspólnoty, kancelaria, kontakt, lokalizacja.
7. **Pozostałe podstrony istniejącej witryny** — do audytu i migracji, w tym materiały organizacyjne i ochrony małoletnich, jeśli są publikowane.
8. **PWA** — instalacja na ekranie głównym, ikony, responsywność, działanie wybranych treści offline.
9. **Web Push** — dobrowolna subskrypcja, powiadomienia o ogłoszeniach i wydarzeniach, otwieranie właściwej podstrony po kliknięciu.

Nie zakładać w MVP kont parafian, płatności, zapisów na wydarzenia, rezerwacji intencji ani bazy danych osobowych parafian. Sama liczba 1700 nie oznacza konieczności przechowywania listy parafian.

## 4. Model redakcyjny w Sveltia CMS

Jedna osoba zarządza treściami przez `/admin/` (lub inny ustalony adres):

- `announcements` — ogłoszenia: tytuł, data, treść, publikacja, opcjonalne wyróżnienie.
- `mass_intentions` — intencje: data, godzina, treść, opcjonalne miejsce.
- `events` — wydarzenia: tytuł, slug, opis, początek, koniec, miejsce, grafika, status, opcje powiadomień.
- `pages` / `settings` — treści stałe, dane kontaktowe, godziny Mszy, linki.
- `gallery` — opcjonalnie, jeśli audyt potwierdzi potrzebę.

Treści zapisywane jako pliki w repozytorium. Każda zmiana powoduje build Astro i publikację. Zaprojektować walidację schematów, sensowne nazewnictwo plików, obsługę strefy `Europe/Warsaw` oraz łatwą edycję przez osobę nietechniczną.

### Autoryzacja CMS

Sveltia CMS używa backendu GitHub. **Nie implementować własnego logowania CMS ani nie zakładać, że Cloudflare Access sam zastępuje uwierzytelnianie GitHub do zapisu treści.** Sprawdzić aktualny, zalecany mechanizm OAuth dla Sveltia CMS z GitHub Pages oraz sposób bezpiecznego utrzymywania sekretów. Redaktor powinien mieć tylko niezbędne uprawnienia do repozytorium; włączyć MFA na koncie GitHub.

## 5. Architektura Web Push

### Rozdzielenie odpowiedzialności

- Sveltia/GitHub — **źródło prawdy dla wydarzeń i ogłoszeń**.
- D1 — **subskrypcje push, kampanie, statusy i historia wysyłek**.
- Worker — rejestracja/wyrejestrowanie subskrypcji, wysyłka, obsługa błędów, harmonogram.

### Subskrypcja użytkownika

1. Użytkownik klika „Włącz powiadomienia”.
2. Przeglądarka pyta o zgodę (tylko po świadomym działaniu użytkownika).
3. Service worker tworzy subskrypcję Push API/VAPID.
4. Frontend wysyła dane subskrypcji do Workera przez HTTPS.
5. Worker zapisuje rekord w D1 (deduplikacja po endpoint/identyfikatorze), z minimalizacją danych i zasadami retencji.
6. Użytkownik może wyłączyć powiadomienia; endpoint usuwa/dezaktywuje subskrypcję.

### Wysyłka ręczna

Administrator wybiera wydarzenie i uruchamia wysyłkę komunikatu. **Sveltia nie oferuje automatycznie przycisku wykonującego dowolny Worker API**: zaprojektować oddzielny, zabezpieczony panel powiadomień lub udokumentowane rozszerzenie/integrację. Nie umieszczać tokenów API w kodzie klienta. Zabezpieczyć endpoint administracyjny (np. Cloudflare Access z walidacją JWT po stronie Workera) i dodać podgląd oraz potwierdzenie wysyłki.

### Wysyłka automatyczna

Administrator tworzy wydarzenie z wyprzedzeniem, opcjonalnie ustawia przypomnienie w dniu wydarzenia (np. 09:00 czasu polskiego). Cron uruchamia Worker, który odczytuje harmonogram kampanii. **Trzeba zaprojektować synchronizację wydarzeń GitHub → D1 lub inny wiarygodny mechanizm dostarczenia harmonogramu**; sam Worker nie odczyta automatycznie plików Markdown ze Sveltia. Rozważyć GitHub Actions po buildzie albo dedykowany endpoint synchronizacyjny z autoryzacją. Zapewnić idempotencję (brak podwójnych wysyłek).

### Skalowanie i limity

- Do ~1700 endpointów, jedna kampania dziennie.
- Nie zakładać, że jeden Worker może niezawodnie wykonać 1700 żądań wychodzących w jednym uruchomieniu. Zweryfikować bieżące limity subrequestów, czasu CPU i Cron oraz zaprojektować partiowanie i kolejkę/zadania z retry.
- Obsługiwać nieaktywne subskrypcje (np. odpowiedzi 404/410), błędy tymczasowe, retry i raport sent/failed.
- Sprawdzić aktualne darmowe limity Workers, D1 i ewentualnego mechanizmu kolejkowania; nie zakładać, że Cloudflare sam jest dostawcą push — dostarczenie odbywa się przez endpointy usług push przeglądarek.
- iOS: Web Push dla web apps dodanych do ekranu początkowego, po uzyskaniu zgody użytkownika; dokładne warunki iOS/iPadOS zweryfikować na aktualnych wersjach.

## 6. Przykładowy model danych D1 (do dopracowania)

- `push_subscriptions`: `id`, `endpoint` (unikalny), `p256dh`, `auth`, `created_at`, `updated_at`, `active`, `last_error_at`.
- `push_campaigns`: `id`, `event_slug`, `title`, `body`, `url`, `scheduled_at`, `status`, `created_at`, `sent_at`.
- `push_deliveries`: `id`, `campaign_id`, `subscription_id`, `status`, `attempts`, `last_error`, `updated_at`.

Wdrożyć politykę retencji, ograniczenie dostępu do danych, walidację żądań, ochronę przed nadużyciami i bezpieczne przechowywanie kluczy VAPID.

## 7. Hosting, wdrożenie i jakość

- Repozytorium GitHub; branch główny, workflow PR dla zmian w kodzie.
- Build Astro w GitHub Actions; automatyczna publikacja na GitHub Pages.
- HTTPS, prawidłowy `base` i `site` w Astro, poprawne ścieżki PWA i scope service workera.
- Weryfikacja kompatybilności GitHub Pages + Sveltia CMS + OAuth.
- Zabezpieczenia: MFA, minimalne uprawnienia tokenów, sekrety w GitHub Actions/Cloudflare, brak sekretów w frontendzie.
- Dostępność (WCAG), Core Web Vitals, SEO, semantyka, czytelne fonty, wydajność mobilna.
- Testy: schematy treści, build, linki, formularze CMS, instalacja PWA, offline, push, retry, duplikaty, harmonogram czasu letniego, urządzenia Android/iOS.
- Kopie bezpieczeństwa: Git jako historia treści, dodatkowy eksport/backup D1 i konfiguracji; procedura odtworzenia.
- RODO/prywatność: polityka prywatności uwzględniająca Web Push, retencję i zewnętrznych dostawców; brak zbędnych danych osobowych.

## 8. Publikacja w sklepach — wariant opcjonalny, nie MVP

Podstawowy wariant to PWA instalowana z przeglądarki. Opcjonalny wariant handlowy obejmuje przygotowanie Android/iOS i zgłoszenie do Google Play / Apple App Store (np. Capacitor, jeśli kompatybilny z architekturą). Wymaga osobnego przetestowania powiadomień w aplikacjach opakowanych, podpisywania buildów, kont deweloperskich i akceptacji sklepów. **Nie zakładać, że Web Push z PWA automatycznie działa w natywnym wrapperze bez zmian**; dla wersji sklepowej może być potrzebna natywna obsługa push (APNs/FCM) i rozszerzenie backendu.

## 9. Uzgodnienia handlowe (kontekst, nie wymagania techniczne)

- Wariant I: **PWA — 14 500 zł netto**.
- Wariant II: **PWA + Android/iOS + publikacja w sklepach — 22 500 zł netto**.
- Orientacyjny termin: **4–6 tygodni od zatwierdzenia projektu**, do weryfikacji po audycie i rozpisaniu backlogu.
- Gwarancja: **12 miesięcy od odbioru**, naprawa błędów wykonawczych, reakcja do **3 dni roboczych**; nie obejmuje nowych funkcji, awarii niezależnych dostawców ani nieautoryzowanych zmian.
- Po gwarancji możliwa osobna umowa opieki technicznej: aktualizacje, backup, monitoring, wsparcie.
- Opłaty Apple/Google za konta deweloperskie nie są zawarte w cenie.

## 10. Decyzje otwarte — Claude Code ma zaproponować, nie zgadywać

1. Audyt obecnej witryny: wszystkie sekcje, typy treści, zdjęcia, SEO, archiwum i zakres migracji.
2. Czy nowa aplikacja **zastępuje obecną witrynę**, czy działa obok niej (subdomena/oddzielny produkt)?
3. Dokładny UX: nawigacja, ekran główny, widok kalendarza, wyszukiwarka intencji.
4. Zakres archiwalnych treści do przeniesienia.
5. Sposób autoryzacji Sveltia + GitHub i domena panelu.
6. Wybór mechanizmu synchronizacji harmonogramu wydarzeń do D1.
7. Projekt niezawodnego fan-out Web Push na darmowym planie Cloudflare.
8. Wariant ręczny, automatyczny lub oba; godzina wysyłki i limit jednej kampanii na dzień.
9. Czy potrzebna będzie wersja sklepowa w pierwszym etapie.
10. Materiały graficzne, identyfikacja wizualna i treści prawne.

## 11. Zadanie startowe dla Claude Code

**Nie rozpoczynaj od razu implementacji.**

1. Odczytaj `PROJECT_BRIEF.md` oraz przeanalizuj strukturę bieżącego repozytorium.
2. Zweryfikuj aktualne wersje i dokumentację Astro, Sveltia CMS, PWA i Cloudflare.
3. Przeprowadź audyt aktualnej strony parafialubiana.pl, jeśli masz dostęp do internetu; jeśli nie, zgłoś ograniczenie i poproś o eksport/treści.
4. Przygotuj proponowaną architekturę, strukturę folderów, schematy Content Collections i konfigurację Sveltia CMS.
5. Opracuj bezpieczny projekt Web Push z D1, synchronizacją wydarzeń, autoryzacją admina, partiowaniem wysyłki i logami.
6. Zaproponuj backlog MVP, kolejność implementacji, kryteria akceptacji i plan testów.
7. Wypisz ryzyka, założenia i pytania wymagające decyzji właściciela projektu.
8. Dopiero po zatwierdzeniu planu przejdź do implementacji etapami.

**Priorytety:** prostota obsługi przez jedną osobę, bezpieczeństwo, trwałość danych, minimalne koszty stałe, wydajność mobilna i możliwość późniejszej publikacji w sklepach.
