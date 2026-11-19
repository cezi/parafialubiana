# Backlog — Parafia Łubiana

Ostatnia aktualizacja: 2026-11-19 · Synchronizacja: `node scripts/backlog-sync.mjs` (zob. [README.md](README.md))

## Decyzje (Etap 0)

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| D-01 | Hosting: Cloudflare Workers Static Assets (podgląd na workers.dev) | decyzja, infra | done | |
| D-02 | Domena przez Cloudflare — przełączenie DNS odłożone | decyzja, infra | done | |
| D-03 | Astro 7 + @vite-pwa/astro 2 (buildSW) — sprawdzone | decyzja, pwa | done | |
| D-04 | Logowanie do Sveltia CMS: sveltia-cms-auth + GitHub App | decyzja, cms | done | |
| D-05 | Web Push: Cloudflare Queues na planie Free — do pomiaru | decyzja, push | done | |
| D-06 | Synchronizacja harmonogramu: pull /push-schedule.json | decyzja, push | done | |
| D-07 | Wysyłka z poziomu Sveltia + panel raportów | decyzja, push | done | |
| D-08 | Reguły wysyłki push: 1/dzień, cisza 21–7, 9:00 | decyzja, push | done | |
| D-09 | Intencje i ogłoszenia: 1 plik na tydzień | decyzja, cms | done | |
| D-10 | Galeria: bez migracji w MVP | decyzja, migracja | done | |
| D-11 | Nekrologi i kronika parafii w MVP | decyzja, cms | done | |
| D-12 | Tylko PWA (bez sklepów) | decyzja | done | |
| D-13 | Repo publiczne, CSV z ankiety poza repo | decyzja, infra | done | |
| D-14 | Bez e-mail i SMS — tylko Web Push | decyzja, push | done | |

## Etap 0 — Przygotowanie i spike'i

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E0-1 | Zatwierdzenie decyzji D-01…D-14 | decyzja | done | |
| E0-2 | Repo, .gitignore, etykiety, kamienie milowe, skrypt backlog-sync, ochrona main | infra | w toku | |
| E0-3 | Dostępy: Cloudflare (konto wykonawcy), webd.pl, rejestrator, konto GitHub redaktora (MFA) | infra | todo | |
| E0-4 | Spike Astro 7 + PWA | pwa | done | |
| E0-5 | Spike Sveltia + sveltia-cms-auth (GitHub App) | cms | todo | |
| E0-6 | Spike Web Push w Workerze + pomiar CPU na partię | push | todo | |
| E0-7 | Inwentaryzacja treści WP + lista materiałów od parafii | migracja | todo | |

## Etap 1 — Fundament i system wizualny

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E1-1 | Projekt Astro, narzędzia, CI na PR | infra | todo | |
| E1-2 | Tokeny wizualne z prototypu, fonty self-hosted | frontend | todo | |
| E1-3 | Layout + kontakt na 1. ekranie mobile | frontend | todo | |
| E1-4 | Komponenty UI | frontend | todo | |
| E1-5 | Deploy na Cloudflare, _headers, _redirects | infra | todo | |

## Etap 2 — Treści i CMS

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E2-1 | Schematy Content Collections + walidacja w CI | cms | todo | |
| E2-2 | Konfiguracja Sveltia CMS | cms | todo | |
| E2-3 | Widoki: Start, Ogłoszenia, Intencje, Msze i nabożeństwa | frontend | todo | |
| E2-4 | Terminarz (lista, miesiąc, ICS, cykliczność) | frontend | todo | |
| E2-5 | Strony parafii (kancelaria, Duszpasterze, grupy, historia, cmentarz, biuletyn, ochrona dzieci, RODO) | frontend, cms | todo | |
| E2-6 | Nekrologi | frontend, cms | todo | |
| E2-7 | Migracja treści z WordPress (bez galerii) | migracja | todo | |
| E2-8 | SEO | frontend | todo | |
| E2-9 | Kronika parafii | frontend, cms | todo | |

## Etap 3 — PWA

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E3-1 | Manifest i ikony | pwa | todo | |
| E3-2 | Service worker i offline | pwa | todo | |
| E3-3 | Baner instalacji + instrukcja iOS | pwa | todo | |
| E3-4 | Aktualizacje service workera | pwa | todo | |

## Etap 4 — Web Push

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E4-1 | D1: migracje, retencja; konfiguracja Workera | push | todo | |
| E4-2 | API subscribe/unsubscribe | push | todo | |
| E4-3 | Przycisk „Włącz powiadomienia” | push, frontend | todo | |
| E4-4 | Generowanie /push-schedule.json | push | todo | |
| E4-5 | Cron: pull harmonogramu, kampanie, partie | push | todo | |
| E4-6 | Konsument kolejki: wysyłka, retry, raport | push | todo | |
| E4-7 | Obsługa push i kliknięcia w SW | push, pwa | todo | |
| E4-8 | Panel /push-admin za Cloudflare Access | push | todo | |

## Etap 5 — Jakość, domena, odbiór

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E5-1 | Dostępność WCAG 2.2 AA | jakość | todo | |
| E5-2 | Wydajność | jakość | todo | |
| E5-3 | Testy E2E | jakość | todo | |
| E5-4 | Testy na urządzeniach | jakość | todo | |
| E5-5 | Polityka prywatności | frontend | todo | |
| E5-6 | Migracja domeny i DNS (sprawdzić pocztę w domenie) | infra, migracja | todo | |
| E5-7 | Monitoring i backup D1 | infra | todo | |
| E5-8 | Szkolenie i instrukcja redaktora | cms | todo | |
| E5-9 | Odbiór + przeniesienie kont na parafię | infra | todo | |

## Faza 2 (osobna wycena)

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| F2-1 | Pełna galeria archiwalna (R2) | migracja | todo | |
| F2-2 | Przycisk „wyślij teraz” w panelu push | push | todo | |
| F2-3 | Kategorie powiadomień | push | todo | |
