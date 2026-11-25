# Spike E0-5 — Sveltia CMS + Sveltia CMS Additions

**Data:** 2026-11-25 · **Panel testowy:** https://pl-cms-spike.parafialubiana.workers.dev/admin/ · **Logowanie:** Worker `parafialubiana-cms` ([workers/cms/](../../workers/cms/))

## Zmiana względem D-04

D-04 zakładało `sveltia-cms-auth` (logowanie przez konto GitHub). 25.11.2026 autorzy Sveltii polecili zamiast niego **Sveltia CMS Additions** (MIT, self-hosted na naszym koncie Cloudflare, plan Free, Durable Object). Najważniejsza różnica: **redaktor loguje się loginem i hasłem, bez konta GitHub**. Decyzja właściciela: testujemy Additions; `sveltia-cms-auth` w odwodzie (przejście = zmiana `auth_type` i `base_url` w `config.yml`).

## Konfiguracja

- `workers/cms/` — szablon `templates/cloudflare` z repo `sveltia/sveltia-cms-additions`, `@sveltia/cms-additions` 1.0.2, nazwa Workera `parafialubiana-cms`. Jedyny sekret: `ADMIN_SECRET` (w menedżerze haseł właściciela; plik lokalny usunięty).
- Kreator („Use Admin Secret”): konto administratora + GitHub App zarejestrowana i zainstalowana tylko na `cezi/parafialubiana`. (Pierwsza próba nie powiodła się przez awarię GitHub 25.11 ok. 17:00; po powrocie GitHuba przeszła bez sprzątania.)
- Panel: Sveltia CMS **0.272.0** (przypięta wersja z unpkg), `backend.auth_type: additions`, wpisy na gałęzi `spike/e0-5-cms`.

## Wyniki

| Test | Wynik |
|---|---|
| Logowanie administratora (konto Additions) | ✅ |
| Dodanie użytkownika bez GitHub (`redaktor-test`), hasło tymczasowe | ✅ — przy pierwszym logowaniu wymuszona zmiana hasła |
| Utworzenie wpisu (administrator) | ✅ commit `3492cc1`, autor `cezi` |
| Edycja wpisu (redaktor bez GitHub) | ✅ commit `ca634d3`, autor **„Redaktor Test”** — każda zmiana podpisana osobą |
| Plik wpisu | ✅ `content/ogloszenia/2026-11-29.md`, poprawny YAML, nazwa z daty |
| Zdjęcie | ✅ konwersja do WebP w przeglądarce (76 KB), **EXIF/GPS usunięte**; zmniejszanie do 1600 px nieprzetestowane (oryginał miał 1000 px) |
| Ochrona `main` (ruleset: bez usuwania i force push) | ✅ założona razem z E0-2; zalecana przez Additions |

## Do poprawy w produkcji (E2-2)

1. **Pole „Punkt” (markdown) pozwala wstawić obraz** — w teście wstawił się pusty `![]()` w środku słowa. Wyłączyć komponenty edytora (`editor_components: []`) i zostawić tylko pogrubienie, kursywę i link.
2. Dodać **Content Security Policy** do strony `/admin/` (zalecenie Additions: `connect-src` z `https:` i `wss:` dla adresu Workera).
3. Przypiąć wersję Sveltia CMS i aktualizować świadomie (Administration pokazuje dostępność nowej wersji Additions).

## Ryzyka i decyzja przed E5-8 (szkolenie redaktora)

- **Brak MFA** — logowanie samym hasłem; MFA i passkeys są „w planach”. Do czasu ich wydania: mocne hasło Proboszcza, sesje wygasają po dobie bezczynności / 7 dniach.
- **Bardzo nowe oprogramowanie** (Additions 1.0.x, wymagana Sveltia ≥ 0.271.0 z 23.11.2026). Obserwować wydania.
- Dane osobowe w Durable Object: loginy, imiona, opcjonalnie e-maile — uwzględnić w polityce prywatności (E5-5).
- Ostateczna decyzja Additions vs `sveltia-cms-auth` — przed E5-8.

## Sprzątanie po Etapie 0

- Usunąć Worker `pl-cms-spike` i gałąź `spike/e0-5-cms`.
- Worker `parafialubiana-cms` i GitHub App **zostają** (produkcja). Konto `redaktor-test` usunąć przed szkoleniem.
