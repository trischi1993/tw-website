// ═══════════════════════════════════════════════════════════════
// INSTAGRAM ERFOLGS-CHECK – Google Apps Script
// ───────────────────────────────────────────────────────────────
// SETUP / UPDATE:
//
// 1. Öffne dein Google Sheet auf sheets.google.com
// 2. Klicke oben auf "Erweiterungen" → "Apps Script"
// 3. Ersetze den bestehenden Code komplett durch diesen Code
// 4. Klicke auf das Disketten-Symbol (Speichern)
// 5. Klicke auf "Bereitstellen" → "Bereitstellung verwalten"
// 6. Klicke auf den Stift bei deiner bestehenden Bereitstellung
// 7. Wähle bei "Version" → "Neue Version"
// 8. Klicke auf "Bereitstellen" – die Web-App-URL bleibt gleich
//
// Bestehende Tabellen werden beim nächsten Eintrag automatisch migriert:
// Zwischen Uhrzeit und Gesamt-Score werden Name und E-Mail eingefügt.
// Optional kann datenSchemaAktualisieren() einmal manuell ausgeführt werden.
// ═══════════════════════════════════════════════════════════════

const DATEN_SHEET = 'Ausfüllungen';
const DASHBOARD_SHEET = 'Dashboard';
const DATEN_SPALTEN = 15;

const DATEN_HEADER = [
  'Datum',
  'Uhrzeit',
  'Name',
  'E-Mail',
  'Gesamt-Score %',
  'Gesamt-Punkte',
  'Level',
  'Schwächster Bereich',
  'Vision & Ziele %',
  'Profil & Positionierung %',
  'Strategie & Content-Funnel %',
  'Content-Produktion %',
  'Analyse & Optimierung %',
  'Angebote & Monetarisierung %',
  'Empfehlung'
];

// Hilfsfunktion: Zahl aus Wert extrahieren (egal ob "67%" oder 67)
function toNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  return parseFloat(String(val).replace('%', '').trim()) || 0;
}

function formatiereHeader(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, DATEN_SPALTEN);
  headerRange.setBackground('#806429');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function erstelleHeader(sheet) {
  sheet.getRange(1, 1, 1, DATEN_SPALTEN).setValues([DATEN_HEADER]);
  formatiereHeader(sheet);
}

function stelleDatenSchemaSicher(sheet) {
  if (sheet.getLastRow() === 0) {
    erstelleHeader(sheet);
    return;
  }

  const vorhandeneHeader = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), DATEN_SPALTEN))
    .getValues()[0]
    .map(value => String(value || '').trim());

  const schemaIstAktuell =
    vorhandeneHeader[0] === 'Datum' &&
    vorhandeneHeader[1] === 'Uhrzeit' &&
    vorhandeneHeader[2] === 'Name' &&
    vorhandeneHeader[3] === 'E-Mail' &&
    vorhandeneHeader[4] === 'Gesamt-Score %';

  if (schemaIstAktuell) {
    sheet.getRange(1, 1, 1, DATEN_SPALTEN).setValues([DATEN_HEADER]);
    formatiereHeader(sheet);
    return;
  }

  const schemaIstAlt =
    vorhandeneHeader[0] === 'Datum' &&
    vorhandeneHeader[1] === 'Uhrzeit' &&
    vorhandeneHeader[2] === 'Gesamt-Score %' &&
    vorhandeneHeader[3] === 'Gesamt-Punkte';

  if (!schemaIstAlt) {
    throw new Error(
      'Das Spaltenschema im Tabellenblatt "Ausfüllungen" wurde nicht erkannt. ' +
      'Es wurden keine Spalten verändert.'
    );
  }

  // Bestehende Daten bleiben vollständig erhalten: Die bisherigen Spalten C–M
  // werden von Google Sheets automatisch nach E–O verschoben.
  sheet.insertColumnsAfter(2, 2);
  sheet.getRange(1, 1, 1, DATEN_SPALTEN).setValues([DATEN_HEADER]);
  formatiereHeader(sheet);
  sheet.autoResizeColumns(1, DATEN_SPALTEN);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);

    // ── Daten-Sheet ──────────────────────────────────────────────
    let dataSheet = ss.getSheetByName(DATEN_SHEET);
    if (!dataSheet) dataSheet = ss.insertSheet(DATEN_SHEET);
    stelleDatenSchemaSicher(dataSheet);

    dataSheet.appendRow([
      data.datum || '',
      data.uhrzeit || '',
      data.name || '',
      data.email || '',
      toNum(data.gesamt_score),
      toNum(data.gesamt_punkte),
      data.level || '',
      data['schwächster_bereich'] || '',
      toNum(data.vision_ziele),
      toNum(data.profil_positionierung),
      toNum(data.strategie_content),
      toNum(data.content_produktion),
      toNum(data.analyse_optimierung),
      toNum(data.angebote_monetarisierung),
      data.empfehlung || ''
    ]);

    dataSheet.autoResizeColumns(1, DATEN_SPALTEN);
    aktualisiereDashboard(ss, dataSheet);

    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function aktualisiereDashboard(ss, dataSheet) {
  stelleDatenSchemaSicher(dataSheet);

  let dash = ss.getSheetByName(DASHBOARD_SHEET);
  if (!dash) {
    dash = ss.insertSheet(DASHBOARD_SHEET);
    ss.setActiveSheet(dash);
    ss.moveActiveSheet(1);
  }
  dash.clear();

  const lastRow = dataSheet.getLastRow();
  const anzahl = lastRow <= 1 ? 0 : lastRow - 1;

  let avgScore = 0, avgB1 = 0, avgB2 = 0, avgB3 = 0, avgB4 = 0, avgB5 = 0, avgB6 = 0;
  let lvl0 = 0, lvl1 = 0, lvl2 = 0;
  let empfEbook = 0, empfAio = 0, empf1to1 = 0;
  let bereichCount = {};

  if (anzahl > 0) {
    const rows = dataSheet.getRange(2, 1, anzahl, DATEN_SPALTEN).getValues();
    rows.forEach(row => {
      avgScore += toNum(row[4]);
      const level = String(row[6] || '');
      if (level.includes('Anfänger')) lvl0++;
      else if (level.includes('Aktiv')) lvl1++;
      else if (level.includes('Skalieren')) lvl2++;

      const bereich = String(row[7] || '');
      if (bereich) bereichCount[bereich] = (bereichCount[bereich] || 0) + 1;

      avgB1 += toNum(row[8]);
      avgB2 += toNum(row[9]);
      avgB3 += toNum(row[10]);
      avgB4 += toNum(row[11]);
      avgB5 += toNum(row[12]);
      avgB6 += toNum(row[13]);

      const empf = String(row[14] || '');
      if (empf.includes('E-Book')) empfEbook++;
      else if (empf.includes('ALL-IN-ONE')) empfAio++;
      else if (empf.includes('1:1') || empf.includes('Erstgespräch')) empf1to1++;
    });

    avgScore = Math.round(avgScore / anzahl);
    avgB1 = Math.round(avgB1 / anzahl);
    avgB2 = Math.round(avgB2 / anzahl);
    avgB3 = Math.round(avgB3 / anzahl);
    avgB4 = Math.round(avgB4 / anzahl);
    avgB5 = Math.round(avgB5 / anzahl);
    avgB6 = Math.round(avgB6 / anzahl);
  }

  let topBereich = '–';
  let topCount = 0;
  Object.entries(bereichCount).forEach(([b, c]) => {
    if (c > topCount) { topBereich = b; topCount = c; }
  });

  const empfMax = Math.max(empfEbook, empfAio, empf1to1);
  let topEmpf = '–';
  if (empfMax > 0) {
    if (empfMax === empfEbook) topEmpf = 'E-Book (' + empfEbook + 'x)';
    else if (empfMax === empfAio) topEmpf = 'ALL-IN-ONE Coaching (' + empfAio + 'x)';
    else topEmpf = '1:1 Coaching (' + empf1to1 + 'x)';
  }

  const pct = (n) => anzahl > 0 ? Math.round(n / anzahl * 100) + '%' : '–';

  const dashRows = [
    ['INSTAGRAM ERFOLGS-CHECK – DASHBOARD', ''],
    ['Zuletzt aktualisiert', new Date().toLocaleString('de-AT')],
    ['', ''],
    ['── ÜBERSICHT ──────────────────', ''],
    ['Ausfüllungen gesamt', anzahl],
    ['Ø Gesamt-Score', anzahl > 0 ? avgScore + '%' : '–'],
    ['Häufigster schwächster Bereich', topBereich + (topCount > 0 ? ' (' + topCount + 'x)' : '')],
    ['', ''],
    ['── DURCHSCHNITT PRO BEREICH ───', ''],
    ['Ø Vision & Ziele', anzahl > 0 ? avgB1 + '%' : '–'],
    ['Ø Profil & Positionierung', anzahl > 0 ? avgB2 + '%' : '–'],
    ['Ø Strategie & Content-Funnel', anzahl > 0 ? avgB3 + '%' : '–'],
    ['Ø Content-Produktion', anzahl > 0 ? avgB4 + '%' : '–'],
    ['Ø Analyse & Optimierung', anzahl > 0 ? avgB5 + '%' : '–'],
    ['Ø Angebote & Monetarisierung', anzahl > 0 ? avgB6 + '%' : '–'],
    ['', ''],
    ['── LEVEL-VERTEILUNG ───────────', ''],
    ['Anfänger (0–50%)', lvl0 + ' Nutzer (' + pct(lvl0) + ')'],
    ['Aktiv (51–84%)', lvl1 + ' Nutzer (' + pct(lvl1) + ')'],
    ['Skalieren (85–100%)', lvl2 + ' Nutzer (' + pct(lvl2) + ')'],
    ['', ''],
    ['── PRODUKTEMPFEHLUNGEN ────────', ''],
    ['Meistempfohlenes Produkt', topEmpf],
    ['E-Book empfohlen', empfEbook + 'x (' + pct(empfEbook) + ')'],
    ['ALL-IN-ONE Coaching empfohlen', empfAio + 'x (' + pct(empfAio) + ')'],
    ['1:1 Coaching empfohlen', empf1to1 + 'x (' + pct(empf1to1) + ')'],
  ];

  dash.getRange(1, 1, dashRows.length, 2).setValues(dashRows);

  dash.getRange(1, 1, 1, 2).setBackground('#806429').setFontColor('#ffffff').setFontWeight('bold').setFontSize(13);
  [4, 9, 17, 22].forEach(r => {
    dash.getRange(r, 1, 1, 2).setBackground('#1d1d1d').setFontColor('#a07830').setFontWeight('bold');
  });
  dash.getRange(2, 1, dashRows.length - 1, 1).setFontWeight('bold');
  dash.setColumnWidth(1, 280);
  dash.setColumnWidth(2, 200);
  dash.setFrozenRows(1);
}

function onEdit(e) {
  // Automatisch neu berechnen, wenn im Ausfüllungen-Tab etwas geändert wird.
  if (e && e.range) {
    const sheet = e.range.getSheet();
    if (sheet.getName() === DATEN_SHEET) {
      const ss = e.source;
      aktualisiereDashboard(ss, sheet);
    }
  }
}

function datenSchemaAktualisieren() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = ss.getSheetByName(DATEN_SHEET);
  if (!dataSheet) dataSheet = ss.insertSheet(DATEN_SHEET);
  stelleDatenSchemaSicher(dataSheet);
  aktualisiereDashboard(ss, dataSheet);
  Logger.log('Datenschema und Dashboard wurden erfolgreich aktualisiert.');
}

function dashboardNeuBerechnen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(DATEN_SHEET);
  if (!dataSheet) { Logger.log('Kein Ausfüllungen-Tab gefunden!'); return; }
  stelleDatenSchemaSicher(dataSheet);
  aktualisiereDashboard(ss, dataSheet);
  Logger.log('Dashboard erfolgreich neu berechnet!');
}

function testEintrag() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = ss.getSheetByName(DATEN_SHEET);
  if (!dataSheet) dataSheet = ss.insertSheet(DATEN_SHEET);
  stelleDatenSchemaSicher(dataSheet);

  dataSheet.appendRow([
    '21.05.2026',
    '14:30',
    'Max Mustermann',
    'max@mustermann.com',
    67,
    36,
    'Aktiv (51-84%)',
    'Angebote & Monetarisierung',
    89,
    78,
    67,
    44,
    56,
    33,
    'ALL-IN-ONE Coaching'
  ]);

  dataSheet.autoResizeColumns(1, DATEN_SPALTEN);
  aktualisiereDashboard(ss, dataSheet);
  Logger.log('Test erfolgreich!');
}
