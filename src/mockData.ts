export interface HomeworkItem {
  id: number;
  subject: string;
  subjectId: number;
  teacher: string;
  description: string;
  createdAt: string;
  deadlineAt: string;
  status: "new" | "in_review" | "checked" | "resend" | "done" | "missed";
  estimate?: number;
  hasFiles?: boolean;
}

export interface SubjectInfo {
  id: number;
  name: string;
  color: string;
}

export const SUBJECTS: SubjectInfo[] = [
  { id: 1, name: "Математика", color: "#7457FE" },
  { id: 2, name: "Русский язык", color: "#0FBBA6" },
  { id: 3, name: "Физика", color: "#3B82F6" },
  { id: 4, name: "История", color: "#F59E0B" },
  { id: 5, name: "Биология", color: "#10B981" },
  { id: 6, name: "Английский", color: "#EC4899" },
  { id: 7, name: "Химия", color: "#EF4444" },
  { id: 8, name: "Литература", color: "#8B5CF6" },
];

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};

export const HOMEWORK_LIST: HomeworkItem[] = [
  // --- Просроченные ---
  { id: 1, subject: "Математика", subjectId: 1, teacher: "Иванова А.П.", description: "Решить уравнения №1-15, стр. 42", createdAt: d(-10), deadlineAt: d(-3), status: "missed" },
  { id: 2, subject: "Русский язык", subjectId: 2, teacher: "Петрова М.С.", description: "Сочинение на тему «Мой любимый герой»", createdAt: d(-8), deadlineAt: d(-2), status: "missed" },
  { id: 3, subject: "Английский", subjectId: 6, teacher: "Смирнова Е.В.", description: "Workbook p.34-35, grammar exercises", createdAt: d(-7), deadlineAt: d(-1), status: "missed" },

  // --- Сегодня ---
  { id: 4, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Лабораторная работа №7 «Измерение ускорения»", createdAt: d(-3), deadlineAt: d(0), status: "resend" },
  { id: 5, subject: "Математика", subjectId: 1, teacher: "Иванова А.П.", description: "Параграф 15, задачи 1-8", createdAt: d(-2), deadlineAt: d(0), status: "new" },
  { id: 6, subject: "История", subjectId: 4, teacher: "Николаев В.Г.", description: "Подготовить доклад о Петре I", createdAt: d(-5), deadlineAt: d(0), status: "checked" },

  // --- Завтра ---
  { id: 7, subject: "Биология", subjectId: 5, teacher: "Кузнецова О.А.", description: "Заполнить таблицу «Типы клеток», параграф 22", createdAt: d(-2), deadlineAt: d(1), status: "new" },
  { id: 8, subject: "Русский язык", subjectId: 2, teacher: "Петрова М.С.", description: "Упражнение 156, 157 — правописание приставок", createdAt: d(-1), deadlineAt: d(1), status: "new" },
  { id: 9, subject: "Химия", subjectId: 7, teacher: "Федорова Л.Н.", description: "Решить задачи на моль (стр. 89)", createdAt: d(-1), deadlineAt: d(1), status: "in_review" },
  { id: 21, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Задачи на закон Ньютона, §12 упр. 3-7", createdAt: d(-4), deadlineAt: d(0), status: "checked" },

  // --- Эта неделя ---
  { id: 10, subject: "Литература", subjectId: 8, teacher: "Соколова Т.М.", description: "Прочитать «Евгений Онегин» главы 3-4", createdAt: d(-3), deadlineAt: d(3), status: "new" },
  { id: 11, subject: "Английский", subjectId: 6, teacher: "Смирнова Е.В.", description: "Write an essay: My Future Profession (150 words)", createdAt: d(-1), deadlineAt: d(4), status: "new" },
  { id: 12, subject: "Математика", subjectId: 1, teacher: "Иванова А.П.", description: "Контрольная подготовка — вариант 3", createdAt: d(0), deadlineAt: d(5), status: "new" },
  { id: 13, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Параграф 18, ответить на вопросы", createdAt: d(0), deadlineAt: d(5), status: "new" },

  // --- Следующая неделя ---
  { id: 14, subject: "История", subjectId: 4, teacher: "Николаев В.Г.", description: "Выучить даты: Северная война", createdAt: d(0), deadlineAt: d(8), status: "new" },
  { id: 15, subject: "Биология", subjectId: 5, teacher: "Кузнецова О.А.", description: "Подготовить гербарий (5 образцов)", createdAt: d(0), deadlineAt: d(9), status: "new" },
  { id: 16, subject: "Химия", subjectId: 7, teacher: "Федорова Л.Н.", description: "Написать уравнения реакций (§24)", createdAt: d(1), deadlineAt: d(10), status: "new" },

  // --- Сданные ---
  { id: 17, subject: "Математика", subjectId: 1, teacher: "Иванова А.П.", description: "Домашняя контрольная — вариант 1", createdAt: d(-14), deadlineAt: d(-7), status: "done", estimate: 5, hasFiles: true },
  { id: 18, subject: "Русский язык", subjectId: 2, teacher: "Петрова М.С.", description: "Изложение по тексту Паустовского", createdAt: d(-12), deadlineAt: d(-5), status: "done", estimate: 4, hasFiles: true },
  { id: 19, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Лабораторная работа №6", createdAt: d(-15), deadlineAt: d(-8), status: "done", estimate: 5, hasFiles: true },
  { id: 20, subject: "Литература", subjectId: 8, teacher: "Соколова Т.М.", description: "Анализ стихотворения Пушкина", createdAt: d(-11), deadlineAt: d(-4), status: "done", estimate: 3, hasFiles: true },
];
