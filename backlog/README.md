# Backlog — zasady

Lokalny backlog jest **źródłem prawdy o postępie**. GitHub Issues (`cezi/parafialubiana`) to jego lustrzane odbicie dla zlecającego i historii.

## Format

Plik [BACKLOG.md](BACKLOG.md) — jedna tabela na etap. Kolumny:

| Kolumna | Znaczenie |
|---|---|
| `ID` | stały identyfikator (`D-xx` decyzja, `E<etap>-<nr>` zadanie, `F2-<nr>` faza 2) — trafia do tytułu Issue jako prefiks `[E2-3]` |
| `Zadanie` | krótki tytuł |
| `Etykiety` | etykiety GitHub, po przecinku |
| `Status` | `todo` · `w toku` · `blokada` · `review` · `done` |
| `Issue` | numer Issue w GitHub (`#12`) — uzupełniany przy synchronizacji |

Szczegóły zadań (kryteria akceptacji) są w [docs/PLAN_WDROZENIA.md](../docs/PLAN_WDROZENIA.md); Issue zawiera kopię kryterium i link do planu.

## Mapowanie na GitHub

- Kamienie milowe: `Etap 0` … `Etap 5`, `Faza 2`.
- Etykiety: `decyzja`, `infra`, `cms`, `frontend`, `pwa`, `push`, `migracja`, `jakość`, `blokada`.
- Status: `done` ↔ Issue zamknięte; `blokada` ↔ etykieta `blokada`; pozostałe = otwarte.

## Synchronizacja

```
node scripts/backlog-sync.mjs --dry-run   # podgląd
node scripts/backlog-sync.mjs             # synchronizacja
node scripts/backlog-sync.mjs --setup     # + etykiety i kamienie milowe (jednorazowo)
node scripts/backlog-sync.mjs --fix-plan-dates  # + przepisz terminy w planie według Milestones
```

1. Wiersze bez numeru Issue → `gh issue create` (tytuł `[ID] Zadanie`, treść z planu/rejestru decyzji) i wpisanie numeru do tabeli.
2. Istniejące → zgodność statusu (zamknięcie/otwarcie, etykieta `blokada`).
3. Kierunek: **lokalnie → GitHub**. Komentarze i zmiany w GitHub nie nadpisują backlogu; Issues spoza backlogu są tylko raportowane.
4. Nowe zadanie = nowy wiersz w tabeli (nowy ID), potem synchronizacja.
5. **Terminy etapów** zmieniasz w GitHub → Milestones (stamtąd czyta je codzienne przypomnienie). Skrypt przy każdym uruchomieniu porównuje je z linią „Terminy kamieni milowych” w [docs/PLAN_WDROZENIA.md](../docs/PLAN_WDROZENIA.md) i zgłasza rozjazd; `--fix-plan-dates` poprawia plan.
6. Termin pojedynczego zadania: linia `Termin: RRRR-MM-DD (opis)` na początku treści Issue.

### Automatycznie (GitHub Actions)

Workflow [.github/workflows/backlog-sync.yml](../.github/workflows/backlog-sync.yml) uruchamia synchronizację z `--fix-plan-dates`:
- po każdym pushu na `main` zmieniającym backlog, plan, decyzje lub skrypt,
- codziennie o 4:30 UTC (przed porannym przypomnieniem),
- ręcznie: zakładka Actions → „Synchronizacja backlogu z Issues” → Run workflow (albo `gh workflow run backlog-sync.yml`).

Jeśli workflow dopisze numery Issues lub poprawi terminy, robi commit `backlog: automatyczna synchronizacja z GitHub` — przed kolejną edycją lokalną zrób `git pull`.
Uwaga: GitHub wyłącza zaplanowane workflow po 60 dniach bez aktywności w repozytorium (wystarczy wtedy włączyć je ponownie w Actions).

Commit z backlogiem: `backlog: <co się zmieniło>`.
