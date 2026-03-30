// ============================================
// Google Apps Script для UX-опроса: Экран заданий (чемпионат)
// ============================================
//
// ИНСТРУКЦИЯ:
// 1. Создай новую Google Таблицу (sheets.new)
// 2. Первый лист переименуй в «Log» (или оставь «Лист1»)
// 3. Открой Расширения → Apps Script
// 4. Удали всё содержимое и вставь этот код
// 5. Нажми «Развернуть» → «Новое развёртывание»
//    - Тип: Веб-приложение
//    - Выполнять от: Меня
//    - Доступ: Все (включая анонимных)
// 6. Скопируй URL развёртывания
// 7. Вставь его в survey/index.html в строку GOOGLE_SCRIPT_URL = '...'
//
// Все данные (ответы, шаринг, заявки) пишутся в один лист.
// Колонка «Тип» отличает строки: survey / answer / share_tg / share_vk / tg_signup / share_landing

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]; // первый лист

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Create header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Время', 'Тип', 'ID', 'Реферер',
      'ЧФ1', 'ЧФ2', 'ЧФ3', 'QW',
      'ПФ1 матч1', 'ПФ1 матч2', 'ПФ1 матч3',
      'ПФ2 матч1', 'ПФ2 матч2',
      'Финал', 'Финал: почему',
      'Важность', 'Не хватает',
      'Значение'
    ]);
  }

  if (data.event) {
    // Event row (answer, share, signup, landing)
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.event || '',
      data.respondent_id || '',
      data.referred_by || '',
      '', '', '', '',
      '', '', '',
      '', '',
      '', '',
      '', '',
      data.value || '',
    ]);
  } else {
    // Full survey submission
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      'survey',
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
      '',
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}
