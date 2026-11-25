// Formularz Google: „Nowa strona parafii — prośba o materiały”.
// Uruchom w script.google.com (nowy projekt → wklej → uruchom createParishMaterialsForm).
// Treść odpowiada docs/migracja/materialy-od-parafii.md.

// ===== DO EDYCJI: tekst wstępu =====
const INTRO = [
  'Szanowny Księże Proboszczu,',
  '',
  'przygotowujemy nową stronę i aplikację parafii. Większość treści przenosimy z obecnej strony. Poniżej to, czego tam nie ma albo co wymaga potwierdzenia. Przy każdej pozycji podajemy, czy jest potrzebna na start, czy może poczekać.',
  '',
  'Materiały najwygodniej przesłać e-mailem (pliki PDF, zdjęcia, zwykły tekst). Wystarczy też krótka odpowiedź „bez zmian”, gdy coś jest aktualne.',
].join('\n');
const FORM_TITLE = 'Parafia Łubiana – nowa strona: prośba o materiały';
const CONFIRMATION = 'Dziękujemy! Pliki (PDF, zdjęcia) prosimy przesłać e-mailem do wykonawcy.';
// ====================================

function createParishMaterialsForm() {
  const form = FormApp.create(FORM_TITLE);
  form.setDescription(INTRO);
  form.setConfirmationMessage(CONFIRMATION);
  form.setProgressBar(true);
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(true);
  const sheet = SpreadsheetApp.create(FORM_TITLE + ' (odpowiedzi)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  const section = (title, help) => form.addPageBreakItem().setTitle(title).setHelpText(help || '');
  const choice = (title, values, help, required) =>
    form.addMultipleChoiceItem().setTitle(title).setHelpText(help || '').setChoiceValues(values).setRequired(required !== false);
  const checks = (title, values, help) =>
    form.addCheckboxItem().setTitle(title).setHelpText(help || '').setChoiceValues(values).showOtherOption(true).setRequired(false);
  const note = (title, help) => form.addParagraphTextItem().setTitle(title).setHelpText(help || '').setRequired(false);

  // Potwierdzenie: wybór „Aktualne / Wymaga zmiany” + pole na poprawkę.
  const confirm = (title, current, startNeeded) => {
    choice(title, ['Aktualne – bez zmian', 'Wymaga zmiany (opis poniżej)'],
      'Obecnie: ' + current + (startNeeded ? '\nPotrzebne na start.' : ''));
    note(title + ' – poprawka', 'Wypełnij tylko, jeśli coś trzeba zmienić.');
  };

  // 1. Potwierdzenie danych
  section('1. Do potwierdzenia', 'Te dane mamy z obecnej strony. Prosimy o potwierdzenie albo poprawkę.');
  confirm('Godziny Mszy świętych', 'niedziele 8:30, 11:00, 15:00 · dni powszednie 18:00', true);
  confirm('Godziny kancelarii', 'w dni powszednie po każdej Mszy; w nagłych sprawach (pogrzeb, namaszczenie chorych, wiatyk) o każdej porze; w niedzielę tylko w pilnych sprawach', true);
  confirm('Telefony i e-mail', '58 687 43 01 · 511 164 621 · plubiana@diecezja-pelplin.pl', true);
  confirm('Numery kont', 'Bank Millennium – PLN 31 1160 2202 0000 0006 4220 4848, EUR 22 1160 2202 0000 0007 2309 7420, dopisek „na cele kultu religijnego”', true);
  confirm('Wpłaty online', 'https://pay.paymove.io/b68f', true);
  confirm('Nabożeństwa i sakramenty', 'lista z zakładki „Nabożeństwa” na obecnej stronie', true);
  confirm('Osoba pierwszego kontaktu ds. ochrony dzieci i młodzieży', 'osoba i telefon podane na obecnej stronie (2024 r.)', true);
  confirm('Cmentarz – godziny otwarcia i opłata', '1.04–30.09: 7:00–22:00, pozostałe miesiące: 8:00–zmrok; 35 zł/rok (placowe i pokładne); regulamin z 2018 r.', true);

  // 2. Standardy ochrony małoletnich
  section('2. Standardy ochrony małoletnich',
    'Ustawa wymaga publikacji standardów na stronie internetowej i wywieszenia w widocznym miejscu, „w wersji zupełnej oraz skróconej, przeznaczonej dla małoletnich” (art. 22c ust. 7 ustawy o przeciwdziałaniu zagrożeniom przestępczością na tle seksualnym i ochronie małoletnich). Obecna zakładka zawiera wstęp do wytycznych diecezjalnych i kontakt – to nie wystarcza.');
  choice('Czy parafia ma przyjęte standardy ochrony małoletnich?',
    ['Tak – prześlę PDF (wersja pełna i skrócona dla dzieci)', 'Tak, ale jest tylko wersja pełna', 'W przygotowaniu', 'Nie wiem'],
    'Potrzebne na start (gdy będą przyjęte).');
  note('Standardy – przewidywany termin lub uwagi');

  // 3. Grupy parafialne
  section('3. Grupy parafialne',
    'Dla każdej grupy: krótki opis, termin spotkań, opiekun i kontakt (tylko jeśli może być publiczny). Może być skrótowo. Potrzebne na start.');
  ['Żywy Różaniec', 'Ministranci i lektorzy', 'Dziecięcy Żywy Różaniec', 'Caritas', 'Grupa Nocnej Adoracji', 'Duchowa Adopcja Dziecka Poczętego']
    .forEach(g => note(g));
  note('Inne grupy lub wspólnoty, których brakuje na liście');

  // 4. Zdjęcie kościoła
  section('4. Zdjęcie kościoła', 'Z zewnątrz, dobra jakość, bez osób; ewentualnie także wnętrze. Potrzebne na start.');
  choice('Zdjęcie kościoła', ['Prześlę e-mailem', 'Nie mamy – prosimy o pomoc', 'Inne (opis poniżej)']);
  note('Zdjęcie kościoła – uwagi');

  // 5. Nekrologi
  section('5. Nekrologi', 'Nowa sekcja na stronie. Prosimy o ustalenie zasad. Potrzebne na start.');
  choice('Publikacja nekrologu', ['Tylko za zgodą rodziny', 'Zawsze, chyba że rodzina sobie nie życzy', 'Inaczej (opis poniżej)']);
  checks('Jakie dane podajemy?', ['Imię i nazwisko', 'Wiek', 'Data śmierci', 'Termin i miejsce pogrzebu', 'Zdjęcie zmarłego']);
  choice('Jak długo nekrolog jest widoczny?', ['Do dnia pogrzebu', '7 dni', '30 dni', 'Inaczej (opis poniżej)']);
  choice('Czy wysyłać powiadomienie na telefony parafian o nowym nekrologu?', ['Tak', 'Nie', 'Decyzja przy każdym nekrologu']);
  note('Nekrologi – uwagi');

  // 6. Kronika parafii
  section('6. Kronika parafii',
    'Nowa sekcja z wpisami i zdjęciami z życia parafii. Zgodnie ze standardami ochrony małoletnich bez pisemnej zgody rodziców nie publikujemy zdjęć, na których dzieci są rozpoznawalne. Może poczekać.');
  choice('Kto będzie dodawał wpisy do Kroniki?', ['Ksiądz Proboszcz', 'Inna osoba (opis poniżej)', 'Jeszcze nie wiadomo']);
  choice('Pisemne zgody rodziców na publikację zdjęć dzieci', ['Parafia już je zbiera', 'Nie zbieramy – prosimy o wzór zgody', 'Nie będziemy publikować zdjęć dzieci']);
  note('Kronika – uwagi');

  // 7. Pytanie techniczne
  section('7. Pytanie techniczne', 'Przy przenosinach strony trzeba zachować działanie poczty.');
  choice('Czy ktoś używa poczty w domenie @parafialubiana.pl (skrzynek innych niż plubiana@diecezja-pelplin.pl)?',
    ['Nie', 'Tak (jakie skrzynki – poniżej)', 'Nie wiem']);
  note('Poczta – uwagi');

  // 8. Uwagi końcowe
  section('8. Uwagi', 'Dziękujemy! W razie pytań jesteśmy do dyspozycji.');
  note('Dodatkowe uwagi i sugestie');

  Logger.log('EDYCJA: ' + form.getEditUrl());
  Logger.log('DLA PARAFII: ' + form.getPublishedUrl());
  Logger.log('ARKUSZ: ' + sheet.getUrl());
}
