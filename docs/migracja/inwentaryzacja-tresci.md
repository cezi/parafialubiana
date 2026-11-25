# Inwentaryzacja treści obecnej strony (WordPress) → nowa aplikacja

**Stan:** 2026-11-25 · **Eksport:** [migration/wp/pages/](../../migration/wp/pages/) (Markdown, skrypt [migration/wp-export.mjs](../../migration/wp-export.mjs)), spis w [migration/wp/manifest.json](../../migration/wp/manifest.json)
Pliki `intencje-mszalne.md`, `ogloszenia-parafialne.md` i `ochrona-dzieci-i-mlodziezy.md` zawierają dane osób (intencje, osoba kontaktowa) — są tylko lokalnie (`migration/.gitignore`), nie w publicznym repo; odtworzysz je poleceniem `npm run export-wp`.
**Powiązane:** [galeria-wp.md](galeria-wp.md) (galerie — nie publikujemy, D-10), [materialy-od-parafii.md](materialy-od-parafii.md)

## 1. Strony WordPress (10) — co, dokąd i jak

| Strona WP (adres) | Ostatnia zmiana | Zawartość | Miejsce w nowej aplikacji | Sposób migracji |
|---|---|---|---|---|
| `/` = `/ogloszenia-parafialne/` | 2026-11-22 | godziny Mszy, ogłoszenia bieżącej niedzieli (12 punktów), plakat `A4_uzdr_lubiana.png` (nie przenosimy), konta bankowe | Start + kolekcja `ogloszenia` (1 plik/tydzień) + `ustawienia` (Msze, konta) | ostatni tydzień ręcznie do CMS przy starcie; godziny i konta → `ustawienia` |
| `/intencje-mszalne/` | 2026-11-15 | porządek Mszy + intencje bieżącego tygodnia | kolekcja `intencje` (1 plik/tydzień) | bieżący tydzień wprowadza redaktor przy starcie |
| `/nabozenstwa/` | 2026-09-15 | nabożeństwa eucharystyczne, różańcowe, fatimskie, nowenna, majowe/czerwcowe, Msze z udziałem osób z niepełnosprawnościami, sakramenty | `ustawienia/nabozenstwa.yml` + strona „Msze i nabożeństwa” | automatycznie z eksportu → YAML (zgodne z prototypem) |
| `/kancelaria-parafialna/` | 2025-03-22 | godziny kancelarii, kontakt, proboszcz, **klauzula informacyjna RODO** | `ustawienia/parafia.yml` (godziny, kontakt) + strona `polityka-prywatnosci` (klauzula + Web Push) | automatycznie; klauzulę uzupełnić o powiadomienia push (E5-5) |
| `/z-zycia-kosciola/` (w menu „KONTAKT”) | 2026-09-18 | adres, telefony, e-mail, konta | `ustawienia/parafia.yml` (dane się powtarzają) | tylko przekierowanie |
| `/duszpasterstwo/` | 2026-09-15 | jedna pozycja: „Otwarte drzwi” — II niedziela miesiąca 13:45 | strona „Duszpasterstwo i grupy” | ręcznie (krótkie) |
| `/grupy/` | 2024-02-21 | 6 nazw grup, **bez opisów** | kolekcja `grupy` | nazwy automatycznie; opisy, terminy, opiekunowie — od parafii |
| `/historia-parafii/` | 2026-09-15 | historia 1968–2025, opis kościoła (wymiary, dzwony, grota) | strony „Historia”, „Duszpasterze” (proboszczowie), „Opis kościoła” | automatycznie + podział na sekcje; kalendarium z treści |
| `/ochrona-dzieci-i-mlodziezy/` | 2024-07-08 | preambuła wytycznych diecezji, **osoba pierwszego kontaktu + telefon**, grafika, link do diecezji | strona „Ochrona dzieci i młodzieży” + kafel na Start (ankieta) | automatycznie; **dodać przyjęte Standardy ochrony małoletnich (PDF)** — wymóg Standardu 1 pkt 1 |
| `/regulamin-cmentarza-parafialnego/` | 2024-01-31 | regulamin §1–§9 (godziny otwarcia, opłaty 35 zł/rok, zasady) | strona „Nasz Cmentarz” (godziny, opłaty, mogily.pl) + podstrona regulaminu | automatycznie; godziny/opłaty → `ustawienia/cmentarz.yml` |

Pliki osadzone w stronach: `2024/07/ochrona-dzieci-300x232.jpg` (grafika diecezjalna), `2026/06/A4_uzdr_lubiana.png` (plakat na stronie głównej — **nie przenosimy**, decyzja 2026-11-25).

## 2. Dane wspólne → `ustawienia` (jedno miejsce w CMS)

| Dane | Wartość z WP | Uwagi |
|---|---|---|
| Nazwa | Parafia Rzymskokatolicka p.w. Świętego Maksymiliana Marii Kolbego | |
| Adres | ul. Kościelna 6, 83-407 Łubiana | |
| Telefony | 58 687 43 01 · 511 164 621 | ankieta: komórkowy na 1. ekranie |
| E-mail | plubiana@diecezja-pelplin.pl | |
| Proboszcz | ks. kan. dr Wojciech Węckowski (od 1.03.2025) | |
| Wpłaty online | https://pay.paymove.io/b68f | przycisk „Wpłać darowiznę online” |
| Konta | Bank Millennium PLN 31 1160 2202 0000 0006 4220 4848 · EUR 22 1160 2202 0000 0007 2309 7420, dopisek „na cele kultu religijnego” | |
| Msze | niedziele 8:30, 11:00, 15:00 · dni powszednie 18:00 | zgodne z prototypem |
| Kancelaria | dni powszednie po każdej Mszy; w nagłych sprawach o każdej porze; w niedzielę tylko pilne | regulamin cmentarza mówi „po wieczornej Mszy” — to samo |
| Cmentarz | 1.04–30.09: 7:00–22:00 · pozostałe: 8:00–zmrok · 35 zł/rok (placowe i pokładne) | wyszukiwarka grobów: mogily.pl/lubiana |
| Ochrona dzieci | osoba pierwszego kontaktu wg WP (imię, nazwisko, telefon) | **potwierdzić aktualność** (strona z 2024 r.) |

## 3. Przekierowania (301) ze starych adresów

Zasada: zachowujemy stare adresy tam, gdzie się da — mniej przekierowań, linki z wyszukiwarek działają.

| Stary adres | Nowy adres |
|---|---|
| `/ogloszenia-parafialne/` | `/ogloszenia/` |
| `/intencje-mszalne/`, `/nabozenstwa/`, `/kancelaria-parafialna/`, `/duszpasterstwo/`, `/grupy/`, `/historia-parafii/`, `/ochrona-dzieci-i-mlodziezy/` | bez zmian |
| `/z-zycia-kosciola/` | `/kancelaria-parafialna/` |
| `/regulamin-cmentarza-parafialnego/` | `/cmentarz/regulamin/` |
| 60 wpisów galerii (`/wielki-tydzien-2008/` … `/i-komunia-sw-2024/`, lista w [galeria-wp.md](galeria-wp.md)) | `/kronika/` |
| `/category/galeria/`, `/feed/`, `/wp-*` | `/` (lub 410) |

## 4. Czego nie przenosimy

- 60 galerii i 1638 zdjęć (D-10 — archiwum ZIP przekazane parafii).
- Archiwum ogłoszeń i intencji — **nie istnieje** (strony nadpisywane co tydzień); archiwum zacznie się od startu nowej strony.
- Kanał RSS komentarzy, konto użytkownika WP, motyw.

## 5. Różnice WP ↔ prototyp do uwzględnienia w E2

- Prototyp ma „Osoba odpowiedzialna: do uzupełnienia” — WP podaje osobę pierwszego kontaktu (do potwierdzenia).
- Prototyp ma sekcję „Dokumenty” w Ochronie dzieci — na WP brak dokumentów; potrzebne Standardy (PDF).
- Prototyp ma „Wpłać darowiznę online →” — link: https://pay.paymove.io/b68f (podany 2026-11-25).
- Prototyp: biuletyn „Lubiano” — numery jeszcze nie istnieją; **dział i karta na stronie głównej ukryte, dopóki redaktor nie wgra pierwszego numeru**.
- Prototyp: „Kalendarium”, „Proboszczowie”, „Opis kościoła” — treść jest w historii WP; do podziału.
- Logo patrona — parafia ma logo, które możemy używać (ikona aplikacji, nagłówek); zdjęcie św. Maksymiliana z prototypu nie jest potrzebne.
- Redaktor strony: Ksiądz Proboszcz (plubiana@diecezja-pelplin.pl).
- Grupy: prototyp przewiduje opis, termin, opiekuna — na WP tylko nazwy.
