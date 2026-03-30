// ============================================
// Google Apps Script для UX-опроса: Экран заданий (чемпионат)
// ============================================
//
// ИНСТРУКЦИЯ:
// 1. Создай новую Google Таблицу (sheets.new)
// 2. Открой Расширения → Apps Script
// 3. Удали всё содержимое и вставь этот код
// 4. Нажми «Развернуть» → «Новое развёртывание»
//    - Тип: Веб-приложение
//    - Выполнять от: Меня
//    - Доступ: Все (включая анонимных)
// 5. Скопируй URL развёртывания
// 6. Вставь его в survey/index.html в строку GOOGLE_SCRIPT_URL = '...'
//
// Одна строка = один ученик.
// Строка создаётся при первом контакте (survey / share_landing).
// Шаринг и telegram-ник дописываются в ту же строку.

// Колонки (1-based):
// 1  Время
// 2  ID
// 3  Реферер
// 4  Telegram
// 5  Шаринг
// 6  ЧФ1
// 7  ЧФ2
// 8  ЧФ3
// 9  QW
// 10 ПФ1 матч1
// 11 ПФ1 матч2
// 12 ПФ1 матч3
// 13 ПФ2 матч1
// 14 ПФ2 матч2
// 15 Финал
// 16 Финал: почему
// 17 Важность
// 18 Не хватает

var COL = { TIME:1, ID:2, REF:3, TG:4, SHARE:5, QF1:6, QF2:7, QF3:8, QW:9, SF1_1:10, SF1_2:11, SF1_3:12, SF2_1:13, SF2_2:14, FINAL:15, FINAL_WHY:16, IMP:17, MISS:18 };
var NUM_COLS = 18;

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ok({ error: 'Invalid JSON' });
  }

  // Ensure header
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Время','ID','Реферер','Telegram','Шаринг',
      'ЧФ1','ЧФ2','ЧФ3','QW',
      'ПФ1 матч1','ПФ1 матч2','ПФ1 матч3',
      'ПФ2 матч1','ПФ2 матч2',
      'Финал','Финал: почему',
      'Важность','Не хватает'
    ]);
  }

  var id = data.respondent_id || '';
  var row = findRow(sheet, id);

  // ── Share click → update Шаринг column ──
  if (data.event === 'share_tg' || data.event === 'share_vk') {
    if (row > 0) {
      var cur = sheet.getRange(row, COL.SHARE).getValue();
      var platform = data.event.replace('share_', '');
      if (cur.indexOf(platform) === -1) {
        sheet.getRange(row, COL.SHARE).setValue(cur ? cur + ', ' + platform : platform);
      }
    }
    return ok({ status: 'ok' });
  }

  // ── Telegram signup → update Telegram column ──
  if (data.event === 'tg_signup') {
    if (row > 0) {
      sheet.getRange(row, COL.TG).setValue(data.value || '');
    } else {
      var empty = newEmptyRow();
      empty[COL.TIME - 1] = data.timestamp || new Date().toISOString();
      empty[COL.ID - 1] = id;
      empty[COL.REF - 1] = data.referred_by || '';
      empty[COL.TG - 1] = data.value || '';
      sheet.appendRow(empty);
    }
    return ok({ status: 'ok' });
  }

  // ── Share landing → create row if new ──
  if (data.event === 'share_landing') {
    if (row < 0 && id) {
      var empty = newEmptyRow();
      empty[COL.TIME - 1] = data.timestamp || new Date().toISOString();
      empty[COL.ID - 1] = id;
      empty[COL.REF - 1] = data.referred_by || '';
      sheet.appendRow(empty);
    }
    return ok({ status: 'ok' });
  }

  // ── Skip per-answer events ──
  if (data.event) {
    return ok({ status: 'ok' });
  }

  // ── Full survey submission → create or update row ──
  var vals = newEmptyRow();
  vals[COL.TIME - 1] = data.timestamp || new Date().toISOString();
  vals[COL.ID - 1] = id;
  vals[COL.REF - 1] = data.referred_by || '';
  // keep existing Telegram & Шаринг if updating
  vals[COL.TG - 1] = '';
  vals[COL.SHARE - 1] = '';
  vals[COL.QF1 - 1] = data.r1_q1 || '';
  vals[COL.QF2 - 1] = data.r2_q1 || '';
  vals[COL.QF3 - 1] = data.r3_q1 || '';
  vals[COL.QW - 1] = data.qw_q1 || '';
  vals[COL.SF1_1 - 1] = data.s1_m1_q1 || '';
  vals[COL.SF1_2 - 1] = data.s1_m2_q1 || '';
  vals[COL.SF1_3 - 1] = data.s1_m3_q1 || '';
  vals[COL.SF2_1 - 1] = data.s2_m1_q1 || '';
  vals[COL.SF2_2 - 1] = data.s2_m2_q1 || '';
  vals[COL.FINAL - 1] = data.final_m1_q1 || '';
  vals[COL.FINAL_WHY - 1] = data.final_q2 || '';
  vals[COL.IMP - 1] = data.imp_q1 || '';
  vals[COL.MISS - 1] = data.miss_q1 || '';

  if (row > 0) {
    // Preserve Telegram & Шаринг from existing row
    var existing = sheet.getRange(row, 1, 1, NUM_COLS).getValues()[0];
    vals[COL.TG - 1] = existing[COL.TG - 1] || '';
    vals[COL.SHARE - 1] = existing[COL.SHARE - 1] || '';
    sheet.getRange(row, 1, 1, NUM_COLS).setValues([vals]);
  } else {
    sheet.appendRow(vals);
  }

  return ok({ status: 'ok' });
}

function findRow(sheet, id) {
  if (!id) return -1;
  var data = sheet.getRange(1, COL.ID, sheet.getLastRow(), 1).getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) return i + 1;
  }
  return -1;
}

function newEmptyRow() {
  var arr = [];
  for (var i = 0; i < NUM_COLS; i++) arr.push('');
  return arr;
}

function ok(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ok({ status: 'ready' });
}
