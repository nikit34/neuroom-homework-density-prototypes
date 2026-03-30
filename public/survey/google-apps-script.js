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

  // Survey answers — fixed columns for all possible matches
  var sheet = ss.getSheetByName('Answers');
  if (!sheet) {
    sheet = ss.insertSheet('Answers');
    sheet.appendRow([
      'Время','ID','Реферер',
      'ЧФ1','ЧФ2','ЧФ3','QW',
      'ПФ1 матч1','ПФ1 матч2','ПФ1 матч3',
      'ПФ2 матч1','ПФ2 матч2',
      'Финал','Финал: почему',
      'Важность','Не хватает',
      'JSON'
    ]);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.respondent_id || '',
    data.referred_by || '',
    data.r1_q1 || '',
    data.r2_q1 || '',
    data.r3_q1 || '',
    data.qw_q1 || '',
    data.s1_m1_q1 || '',
    data.s1_m2_q1 || '',
    data.s1_m3_q1 || '',
    data.s2_m1_q1 || '',
    data.s2_m2_q1 || '',
    data.final_m1_q1 || '',
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
