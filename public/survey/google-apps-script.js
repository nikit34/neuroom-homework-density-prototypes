// ============================================
// Google Apps Script для UX-опроса: Экран заданий (чемпионат)
// ============================================
//
// ИНСТРУКЦИЯ:
// 1. Создай новую Google Таблицу (sheets.new)
// 2. Создай листы: «Answers», «Events»
// 3. Открой Расширения → Apps Script
// 4. Удали всё содержимое и вставь этот код
// 5. Нажми «Развернуть» → «Новое развёртывание»
//    - Тип: Веб-приложение
//    - Выполнять от: Меня
//    - Доступ: Все (включая анонимных)
// 6. Скопируй URL развёртывания
// 7. Вставь его в survey/index.html в строку GOOGLE_SCRIPT_URL = '...'
//
// Лист «Answers» — ответы на опрос (столбцы создаются динамически)
// Лист «Events» — события: шаринг (share_tg, share_vk), заявки (tg_signup)

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Events (share clicks, telegram signups)
  if (data.event) {
    var evSheet = ss.getSheetByName('Events');
    if (!evSheet) { evSheet = ss.insertSheet('Events'); evSheet.appendRow(['Время', 'ID', 'Реферер', 'Событие', 'Значение']); }
    evSheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.respondent_id || '',
      data.referred_by || '',
      data.event || '',
      data.value || '',
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Survey answers — store as JSON blob + key columns
  var sheet = ss.getSheetByName('Answers');
  if (!sheet) { sheet = ss.insertSheet('Answers'); sheet.appendRow(['Время','ID','Реферер','ЧФ1','ЧФ2','ЧФ3','QW','ПФ матчи','Финал: почему','Важность','Не хватает','Все данные (JSON)']); }

  // Collect all semi/final match answers into one string
  var sfMatches = [];
  for (var key in data) {
    if (key.match(/^(s1|s2|final)_m\d+_q1$/)) sfMatches.push(key + ': ' + data[key]);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.respondent_id || '',
    data.referred_by || '',
    data.r1_q1 || '',
    data.r2_q1 || '',
    data.r3_q1 || '',
    data.qw_q1 || '',
    sfMatches.join('; ') || '',
    data.final_q2 || '',
    data.imp_q1 || '',
    data.miss_q1 || '',
    JSON.stringify(data),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}
