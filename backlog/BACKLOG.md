# Backlog — Parafia Łubiana

Ostatnia aktualizacja: 2026-11-19 · Synchronizacja: `node scripts/backlog-sync.mjs` (zob. [README.md](README.md))

## Decyzje (Etap 0)

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| D-01 | Hosting: Cloudflare Workers Static Assets (podgląd na workers.dev) | decyzja, infra | done | #1 |
| D-02 | Domena przez Cloudflare — przełączenie DNS odłożone | decyzja, infra | done | #2 |
| D-03 | Astro 7 + @vite-pwa/astro 2 (buildSW) — sprawdzone | decyzja, pwa | done | #3 |
| D-04 | Logowanie do Sveltia CMS: sveltia-cms-auth + GitHub App | decyzja, cms | done | #4 |
| D-05 | Web Push: Cloudflare Queues na planie Free — do pomiaru | decyzja, push | done | #5 |
| D-06 | Synchronizacja harmonogramu: pull /push-schedule.json | decyzja, push | done | #6 |
| D-07 | Wysyłka z poziomu Sveltia + panel raportów | decyzja, push | done | #7 |
| D-08 | Reguły wysyłki push: 1/dzień, cisza 21–7, 9:00 | decyzja, push | done | #8 |
| D-09 | Intencje i ogłoszenia: 1 plik na tydzień | decyzja, cms | done | #9 |
| D-10 | Galeria: bez migracji i bez publikacji; archiwum ZIP dla parafii | decyzja, migracja | done | #10 |
| D-11 | Nekrologi i kronika parafii w MVP | decyzja, cms | done | #11 |
| D-12 | Tylko PWA (bez sklepów) | decyzja | done | #12 |
| D-13 | Repo publiczne, CSV z ankiety poza repo | decyzja, infra | done | #13 |
| D-14 | Bez e-mail i SMS — tylko Web Push | decyzja, push | done | #14 |

## Etap 0 — Przygotowanie i spike'i

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E0-1 | Zatwierdzenie decyzji D-01…D-14 | decyzja | done | #15 |
| E0-2 | Repo, .gitignore, etykiety, kamienie milowe, skrypt backlog-sync, ochrona main | infra | w toku | #16 |
| E0-3 | Konto Cloudflare (na wykonawcy) — pozostałe dostępy przy przejściu na produkcję | infra | done | #17 |
| E0-4 | Spike Astro 7 + PWA | pwa | done | #18 |
| E0-5 | Spike Sveltia + sveltia-cms-auth (GitHub App) | cms | todo | #19 |
| E0-6 | Spike Web Push w Workerze + pomiar CPU na partię | push | done | #20 |
| E0-7 | Inwentaryzacja treści WP + lista materiałów od parafii | migracja | todo | #21 |

## Etap 1 — Fundament i system wizualny

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E1-1 | Projekt Astro, narzędzia, CI na PR | infra | todo | #22 |
| E1-2 | Tokeny wizualne z prototypu, fonty self-hosted | frontend | todo | #23 |
| E1-3 | Layout + kontakt na 1. ekranie mobile | frontend | todo | #24 |
| E1-4 | Komponenty UI | frontend | todo | #25 |
| E1-5 | Deploy na Cloudflare, _headers, _redirects | infra | todo | #26 |

## Etap 2 — Treści i CMS

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E2-1 | Schematy Content Collections + walidacja w CI | cms | todo | #27 |
| E2-2 | Konfiguracja Sveltia CMS | cms | todo | #28 |
| E2-3 | Widoki: Start, Ogłoszenia, Intencje, Msze i nabożeństwa | frontend | todo | #29 |
| E2-4 | Terminarz (lista, miesiąc, ICS, cykliczność) | frontend | todo | #30 |
| E2-5 | Strony parafii (kancelaria, Duszpasterze, grupy, historia, cmentarz, biuletyn, ochrona dzieci, RODO) | frontend, cms | todo | #31 |
| E2-6 | Nekrologi | frontend, cms | todo | #32 |
| E2-7 | Migracja treści z WordPress (bez galerii) | migracja | todo | #33 |
| E2-8 | SEO | frontend | todo | #34 |
| E2-9 | Kronika parafii | frontend, cms | todo | #35 |

## Etap 3 — PWA

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E3-1 | Manifest i ikony | pwa | todo | #36 |
| E3-2 | Service worker i offline | pwa | todo | #37 |
| E3-3 | Baner instalacji + instrukcja iOS | pwa | todo | #38 |
| E3-4 | Aktualizacje service workera | pwa | todo | #39 |

## Etap 4 — Web Push

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E4-1 | D1: migracje, retencja; konfiguracja Workera | push | todo | #40 |
| E4-2 | API subscribe/unsubscribe | push | todo | #41 |
| E4-3 | Przycisk „Włącz powiadomienia” | push, frontend | todo | #42 |
| E4-4 | Generowanie /push-schedule.json | push | todo | #43 |
| E4-5 | Cron: pull harmonogramu, kampanie, partie | push | todo | #44 |
| E4-6 | Konsument kolejki: wysyłka, retry, raport | push | todo | #45 |
| E4-7 | Obsługa push i kliknięcia w SW | push, pwa | todo | #46 |
| E4-8 | Panel /push-admin za Cloudflare Access | push | todo | #47 |

## Etap 5 — Jakość, domena, odbiór

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| E5-1 | Dostępność WCAG 2.2 AA | jakość | todo | #48 |
| E5-2 | Wydajność | jakość | todo | #49 |
| E5-3 | Testy E2E | jakość | todo | #50 |
| E5-4 | Testy na urządzeniach | jakość | todo | #51 |
| E5-5 | Polityka prywatności | frontend | todo | #52 |
| E5-6 | Migracja domeny i DNS: dostęp do webd.pl i rejestratora, sprawdzić pocztę w domenie | infra, migracja | todo | #53 |
| E5-7 | Monitoring i backup D1 | infra | todo | #54 |
| E5-8 | Konto GitHub redaktora (MFA), szkolenie i instrukcja redaktora | cms | todo | #55 |
| E5-9 | Odbiór + przeniesienie kont na parafię | infra | todo | #56 |

## Faza 2 (osobna wycena)

| ID | Zadanie | Etykiety | Status | Issue |
|---|---|---|---|---|
| F2-1 | Archiwum ZIP oryginałów galerii dla parafii (bez publikacji) | migracja | done | #57 |
| F2-2 | Przycisk „wyślij teraz” w panelu push | push | todo | #58 |
| F2-3 | Kategorie powiadomień | push | todo | #59 |
