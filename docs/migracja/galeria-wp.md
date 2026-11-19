# Galeria na obecnej stronie WordPress — spis do archiwizacji

Stan: 2026-11-19 · Źródło: REST API `https://parafialubiana.pl/wp-json/wp/v2/posts` (kategoria GALERIA, 60 wpisów).
Decyzja D-10: **nie migrujemy w MVP**. Przed wyłączeniem WordPressa należy wykonać pełny eksport dla parafii.

## Gdzie leżą pliki

- Wszystkie media (1638 plików, ~1,7 GB, w tym 1625 JPG, 10 PNG, 2 PDF, 1 MP4): `https://parafialubiana.pl/wp-content/uploads/<rok>/<miesiąc>/` — w większości `/wp-content/uploads/2024/…` (pliki zaimportowane ponownie w 2024 r., dlatego daty nie odpowiadają datom wydarzeń).
- Lista mediów z adresami: `https://parafialubiana.pl/wp-json/wp/v2/media?per_page=100&page=1` … `page=17` (pole `source_url`; powiązanie z wpisem — pole `post`).
- Na serwerze (panel webd.pl / FTP): katalog `wp-content/uploads/` w katalogu WordPressa — najprostszy sposób na pełny eksport (spakować cały katalog).

## Wpisy galerii (60)

| Data | Tytuł | Adres |
|---|---|---|
| 2008-04-08 | WIELKI TYDZIEŃ 2008 | https://parafialubiana.pl/wielki-tydzien-2008/ |
| 2008-04-22 | BIERZMOWANIE 2008 | https://parafialubiana.pl/bierzmowanie-2008/ |
| 2008-10-09 | DROGA KRZYŻOWA 9.10.2008 | https://parafialubiana.pl/droga-krzyzowa-9-10-2008/ |
| 2008-10-10 | 25-LECIE PARAFII | https://parafialubiana.pl/15-lecie-parafii/ |
| 2008-12-08 | PEREGRYMACJA OBRAZU M.B. KRÓL. RODZIN | https://parafialubiana.pl/peregrymacja-obrazu-m-b-krol-rodzin/ |
| 2009-04-14 | GRÓB I CIEMNICA 2009 | https://parafialubiana.pl/grob-i-ciemnica-2009/ |
| 2009-04-22 | BIERZMOWANIE 2009 | https://parafialubiana.pl/bierzmowanie-2009/ |
| 2009-05-05 | ORLIK 2009 | https://parafialubiana.pl/orlik-2009/ |
| 2009-05-10 | I KOMUNIA ŚW. 2009 | https://parafialubiana.pl/i-komunia-sw-2009/ |
| 2009-09-28 | RELIKWIE – NIEPOKALANÓW | https://parafialubiana.pl/relikwie-niepokalanow/ |
| 2009-10-02 | 40 LECIE ZSP LUBIANA RELIKWIE ŚW. MAKSYMILIANA | https://parafialubiana.pl/40-lecie-zsp-lubiana-relikwie-sw-maksymiliana/ |
| 2010-02-08 | ZJAZD ROCZNIKA ŚWIECEŃ 1987 W PELPLINIE – ŁUBIANA 8 LUTEGO 2010 | https://parafialubiana.pl/zjazd-rocznika-swiecen-1987-w-pelplinie-lubiana-8-lutego-2010/ |
| 2010-05-01 | WYJAZD Z POMOCĄ DLA POWODZIAN Z WILKOWA 30 MAJA 2010 | https://parafialubiana.pl/wyjazd-z-pomoca-dla-powodzian-z-wilkowa-30-maja-2010/ |
| 2010-05-09 | I KOMUNIA ŚW. 2010 | https://parafialubiana.pl/i-komunia-sw-2010/ |
| 2010-10-07 | ODPUST 2010 | https://parafialubiana.pl/odpust-2010/ |
| 2010-10-27 | BIERZMOWANIE 2010 | https://parafialubiana.pl/bierzmowanie-2010/ |
| 2010-11-22 | ZAŁOŻENIE KSM-U 22.11.2010 | https://parafialubiana.pl/zalozenie-ksm-u-22-11-2010/ |
| 2010-12-05 | KOLĘDOWANIE KSM-U | https://parafialubiana.pl/koledowanie-ksm-u/ |
| 2010-12-13 | OPŁATEK KSM-U 13.12.2010 | https://parafialubiana.pl/oplatek-ksm-u-13-12-2010/ |
| 2010-12-25 | BOŻE NARODZENIE 2010 | https://parafialubiana.pl/boze-narodzenie-2010/ |
| 2011-01-09 | JASEŁKA 2011 | https://parafialubiana.pl/jaselka-2010/ |
| 2011-04-22 | TRIDUUM PASCHALNE 2011 | https://parafialubiana.pl/triduum-paschalne-2011/ |
| 2012-02-12 | JUBILEUSZ 25-LECIA 12.02.2012 | https://parafialubiana.pl/jubileusz-25-lecia-12-02-2012/ |
| 2012-10-16 | DZIEŃ PAPIESKI – SADZENIE DĘBU 16.10.2012 | https://parafialubiana.pl/dzien-papieski-sadzenie-debu-16-10-2010/ |
| 2013-01-13 | WIELKA ORKIESTRA ŚWIĄTECZNEJ POMOCY 2013 | https://parafialubiana.pl/wielka-orkiestra-swiatecznej-pomocy-2013/ |
| 2013-01-27 | 93 ROCZNICA WKROCZENIA WOJSK POLSKICH | https://parafialubiana.pl/93-rocznica-wkroczenia-wojsk-polskich/ |
| 2013-03-11 | REKOLEKCJE WIELKOPOSTNE 2013 | https://parafialubiana.pl/rekolekcje-wielkopostne-2013/ |
| 2013-03-28 | WIELKI TYDZIEŃ 2013 | https://parafialubiana.pl/wielki-tydzien-2013/ |
| 2013-04-04 | WIELKA SOBOTA 2017 | https://parafialubiana.pl/wielka-sobota-2017/ |
| 2013-05-05 | I KOMUNIA ŚW. 2013 | https://parafialubiana.pl/i-komunia-sw-2013/ |
| 2013-05-27 | MAJOWE – DZIAŁKI 2013 | https://parafialubiana.pl/majowe-dzialki-2013/ |
| 2013-08-26 | ŁAGIEWNIKI | https://parafialubiana.pl/lagiewniki/ |
| 2013-10-10 | NUNCJUSZ APOSTOLSKI W ŁUBIANIE – 10.10.2013 | https://parafialubiana.pl/nuncjusz-apostolski-w-lubianie-10-10-2013/ |
| 2013-10-28 | PROMOCJA KSIĄŻKI 2013 | https://parafialubiana.pl/promocja-ksiazki-2013/ |
| 2013-11-06 | ALBUM FOTOGRAFICZNY | https://parafialubiana.pl/album-fotograficzny/ |
| 2013-12-08 | PRZEDSTAWIENIE ŚW. FAUSTYNA | https://parafialubiana.pl/przedstawienie-sw-faustyna/ |
| 2014-01-06 | ŚWIĘTO TRZECH KRÓLI | https://parafialubiana.pl/swieto-trzech-kroli/ |
| 2014-04-02 | REKOLEKCJE 2014 | https://parafialubiana.pl/rekolekcje-2014/ |
| 2014-04-13 | DZIEŃ MŁODZIEŻY | https://parafialubiana.pl/dzien-mlodziezy/ |
| 2014-04-17 | WIELKANOC 2014 | https://parafialubiana.pl/wielkanoc-2014/ |
| 2014-04-18 | DROGA KRZYŻOWA – WIELKI PIĄTEK 2014 | https://parafialubiana.pl/droga-krzyzowa-wielki-piatek-2014/ |
| 2014-05-21 | KARDYNAŁ KAZIMIERZ NYCZ W ŁUBIANIE | https://parafialubiana.pl/kardynal-kazimierz-nycz-w-lubianie/ |
| 2014-06-19 | BOŻE CIAŁO – 2014 | https://parafialubiana.pl/boze-cialo-2014/ |
| 2014-07-01 | LICHEŃ 2014 | https://parafialubiana.pl/lichen-2014/ |
| 2014-07-01 | WYCIECZKA DO LICHENIA – 1.07.2014 | https://parafialubiana.pl/wycieczka-do-lichenia-1-07-2014/ |
| 2014-07-21 | NIEPOKALANÓW – WARSZAWA | https://parafialubiana.pl/niepokalanow-warszawa/ |
| 2014-08-01 | POWSTANIE WARSZAWSKIE | https://parafialubiana.pl/powstanie-warszawskie/ |
| 2014-08-06 | SIANOWO 2014 | https://parafialubiana.pl/sianowo-2014/ |
| 2014-10-10 | ODPUST 2014 | https://parafialubiana.pl/odpust-2014/ |
| 2014-10-12 | DZIEŃ PAPIESKI 2014 | https://parafialubiana.pl/dzien-papieski-2014/ |
| 2014-12-05 | MIKOŁAJ W ŁUBIANIE | https://parafialubiana.pl/mikolaj-w-lubianie/ |
| 2017-04-03 | WIELKI PIĄTEK 2017 | https://parafialubiana.pl/wielki-piatek-2017/ |
| 2021-05-09 | I KOMUNIA ŚW. 2021 | https://parafialubiana.pl/i-komunia-sw-2021/ |
| 2022-05-08 | I KOMUNIA ŚW. 2022 | https://parafialubiana.pl/ikomunia-sw-2022/ |
| 2023-04-28 | BIERZMOWANIE 2023 | https://parafialubiana.pl/bierzmowanie-2023/ |
| 2023-05-15 | I KOMUNIA ŚW. 2023 | https://parafialubiana.pl/i-komunia-sw-2023/ |
| 2024-05-03 | Relikwie rodziny Ulmów | https://parafialubiana.pl/relikwie-rodziny-ulmow/ |
| 2024-06-03 | Nowy krzyż na cmentarzu | https://parafialubiana.pl/nowy-krzyz-na-cmentarzu/ |
| 2024-06-10 | Boże Ciało 2024 | https://parafialubiana.pl/boze-cialo-2024/ |
| 2024-06-10 | I KOMUNIA ŚW. 2024 | https://parafialubiana.pl/i-komunia-sw-2024/ |
