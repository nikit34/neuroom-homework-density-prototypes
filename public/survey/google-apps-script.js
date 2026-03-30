// ============================================
// Google Apps Script для UX-опроса: Экран заданий
// ============================================
//
// ИНСТРУКЦИЯ:
// 1. Создай новую Google Таблицу (sheets.new)
// 2. Переименуй первый лист в «HwDensity»
// 3. Заголовки создадутся автоматически при первом ответе
// 4. Открой Расширения → Apps Script
// 5. Удали всё содержимое и вставь этот код
// 6. Нажми «Развернуть» → «Новое развёртывание»
//    - Тип: Веб-приложение
//    - Выполнять от: Меня
//    - Доступ: Все (включая анонимных)
// 7. Скопируй URL развёртывания
// 8. Вставь его в survey/index.html в строку GOOGLE_SCRIPT_URL = '...'
//

// Столбцы:
// Время | ЧФ1: Списки | ЧФ2: Время | ЧФ3: Доски | ЧФ4: Quick Wins |
// ПФ1 | ПФ2 | Финал | Финал: почему | Важность | Чего не хватает

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HwDensity');

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.r1_q1 || '',
    data.r2_q1 || '',
    data.r3_q1 || '',
    data.qw_q1 || '',
    data.s1_q1 || '',
    data.s2_q1 || '',
    data.final_q1 || '',
    data.final_q2 || '',
    data.imp_q1 || '',
    data.f_q1 || '',
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
