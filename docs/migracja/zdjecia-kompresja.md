# Zdjęcia: kompresja archiwum i koszt obsługi (Kronika parafii)

> **Decyzja 2026-11-19:** zdjęć z archiwum WP **nie publikujemy** (wizerunki dzieci bez zgód). Parafia dostaje ZIP z oryginałami. Punkty 1–2 i 5 mają charakter informacyjny; punkty 3–4 (Kronika) obowiązują.

**Pomiar:** 2026-11-19 · próbka warstwowa 60 oryginałów z parafialubiana.pl · kompresja `sharp` 0.34 · dokładność szacunku ok. ±20%

## 1. Co jest na obecnej stronie

| Grupa | Liczba | Oryginał (średnio) | Dłuższy bok | Razem |
|---|---|---|---|---|
| Zdjęcia z sufiksem `-scaled` (oryginał = adres bez `-scaled`) — lustrzanka, 2024–2026 | 373 | ~2,9 MB | 3078–6016 px (mediana ~5000) | **~1,09 GB** |
| Pozostałe (głównie import z lutego 2024, stare albumy 2008–2015) | 1262 | ~116 KB | 389–1600 px (mediana 768) | **~0,14 GB** |
| PDF/MP4 | 3 | — | — | pomijalne |
| **Razem do pobrania** | **1638** | | | **~1,2 GB** |

Uwaga: 1597 plików nie jest przypisanych do wpisu w bibliotece mediów WP — przypisanie zdjęć do albumów trzeba odczytać z treści 60 wpisów galerii ([galeria-wp.md](galeria-wp.md)).

## 2. Kompresja — wyniki (średnio na plik)

| Wariant | `-scaled` | pozostałe | Całe archiwum |
|---|---|---|---|
| Oryginały | 2992 KB | 116 KB | ~1,2 GB |
| WebP 2048 px, q80 | 264 KB | 62 KB | ~173 MB |
| **WebP 1600 px, q78** | **152 KB** | **58 KB** | **~127 MB** |
| WebP 1600 px, q85 (domyślne Sveltia) | 209 KB | 75 KB | ~169 MB |
| AVIF 1600 px, q55 | 116 KB | 49 KB | ~103 MB |
| WebP 1200 px, q75 | 86 KB | 46 KB | ~88 MB |
| JPEG 1600 px, q80 (mozjpeg) | 198 KB | 68 KB | ~156 MB |
| Miniatura WebP 480 px, q70 | 21 KB | 20 KB | ~32 MB |

**Rekomendacja dla archiwum:** WebP 1600 px q78 + miniatura 480 px → **~160 MB łącznie (−87% wobec oryginałów)**, ~3270 plików.
AVIF daje dodatkowo ~20% mniej, ale koduje się kilka razy wolniej, a Sveltia przy uploadzie i tak konwertuje tylko do WebP — prościej trzymać jeden format.

Czas: kompresja ~0,8 s na duży plik i ~0,13 s na mały → **całe archiwum ~8 min** na zwykłym komputerze, plus pobranie ~1,2 GB (z przerwami, żeby nie obciążać serwera WP).

## 3. Nowe zdjęcia w Kronice parafii

Sveltia CMS (✅ sprawdzone w typach `@sveltia/cms` 0.270 i dokumentacji) **kompresuje zdjęcia w przeglądarce przed wysłaniem**:

```yaml
media_libraries:
  default:
    config:
      max_file_size: 26214400   # 25 MB — odrzuca np. filmy; zdjęcia z telefonu przechodzą
      transformations:
        raster_image: { format: webp, quality: 80, width: 1600, height: 1600 }
```

Scenariusz: 2 wpisy w miesiącu × 15 zdjęć = 360 zdjęć/rok.

| | Bez kompresji (zdjęcia z telefonu 3–8 MB) | Z kompresją Sveltia |
|---|---|---|
| Przyrost repozytorium | **~1,4 GB/rok** ❌ | **~60–75 MB/rok** ✅ |

Miniatury generuje build Astro (`astro:assets`) — nie trafiają do repo; cache obrazów w GitHub Actions, żeby build nie przeliczał archiwum za każdym razem.

## 4. Gdzie trzymać zdjęcia i ile to kosztuje

| Opcja | Koszt/mies. | Plusy | Minusy |
|---|---|---|---|
| **A. Repo Git + Cloudflare Workers Static Assets** | **0 zł** — zapytania o pliki statyczne darmowe i bez limitu, przechowywanie bez opłat ✅ | zero dodatkowych usług i kont; redaktor nic nie konfiguruje; historia w Git | limit 20 000 plików na wersję (Free) i 25 MiB/plik ✅; repo rośnie (archiwum 160 MB + ~70 MB/rok → ~0,5 GB po 5 latach; GitHub zaleca < 1 GB) |
| B. Cloudflare R2 | 0 zł do 10 GB, transfer bezpłatny; potem ~0,06 zł/GB | repo zostaje lekkie | publiczny dostęp produkcyjny wymaga domeny w Cloudflare (D-02 odłożone); integracja Sveltia z R2 wymaga kluczy dostępu po stronie redaktora — gorsze UX i bezpieczeństwo |
| C. Cloudflare Images | od ~21 zł ⚠️ (orientacyjnie 5 USD za 100 tys. zapisanych + 1 USD za 100 tys. wyświetleń) | automatyczne warianty rozmiarów | płatne bez potrzeby przy tej skali |
| D. Cloudinary / Uploadcare | 0 zł w planie darmowym ⚠️ | gotowa integracja w Sveltia | kolejny zewnętrzny dostawca (USA), limity planu darmowego |

**Rekomendacja: A.** Koszt utrzymania zdjęć: **0 zł/mies.** przez wiele lat. Ponowna ocena (przejście na R2), gdy repo przekroczy ~800 MB. **Nie używać Git LFS** — każdy build w CI pobiera pliki LFS i zużywa limit transferu GitHub LFS ⚠️.

## 5. Koszt jednorazowy — migracja archiwum do Kroniki (F2-1)

Propozycja: 60 albumów z lat 2008–2024 staje się 60 historycznymi wpisami Kroniki (tytuł i data z WP, zdjęcia skompresowane). Galeria i Kronika to wtedy jedna sekcja.

| Krok | Szacunek |
|---|---|
| Skrypt: pobranie oryginałów, kompresja, miniatury | 2–3 h |
| Mapowanie zdjęć do albumów z treści 60 wpisów WP + wygenerowanie wpisów Kroniki | 3–4 h |
| Przegląd z parafią (usunięcie duplikatów, zdjęć z wizerunkiem dzieci bez zgody itp.) | 1–2 h + czas parafii |
| **Razem** | **~1–1,5 dnia pracy** |

Ryzyko RODO/ochrona dzieci: archiwum zawiera zdjęcia z I Komunii i bierzmowania (wizerunki dzieci). Przed ponowną publikacją warto, żeby parafia potwierdziła, które albumy wracają.
