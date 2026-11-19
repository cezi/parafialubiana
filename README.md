# Parafia św. Maksymiliana Marii Kolbego w Łubianie — aplikacja PWA

Nowa strona parafii jako PWA (instalacja na telefonie, powiadomienia Web Push), następca obecnej witryny parafialubiana.pl.

**Stack:** Astro 7 · Sveltia CMS · Cloudflare Workers (static assets, D1, Queues, Cron) · GitHub Actions

## Dokumenty

- [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md) — założenia projektu
- [docs/PLAN_WDROZENIA.md](docs/PLAN_WDROZENIA.md) — plan wdrożenia, etapy, kryteria akceptacji
- [docs/DECYZJE.md](docs/DECYZJE.md) — rejestr decyzji
- [docs/migracja/galeria-wp.md](docs/migracja/galeria-wp.md) — spis galerii obecnej strony
- [backlog/BACKLOG.md](backlog/BACKLOG.md) — postęp prac (synchronizowany z GitHub Issues)
- [prototype/](prototype/) — prototyp UI zatwierdzony w konsultacjach

## Backlog ↔ Issues

```
node scripts/backlog-sync.mjs --dry-run
node scripts/backlog-sync.mjs
```
