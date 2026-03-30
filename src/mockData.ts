export interface HomeworkItem {
  id: number;
  subject: string;
  subjectId: number;
  teacher: string;
  description: string;
  createdAt: string;
  deadlineAt: string;
  /** 10=не сдано, 20=проверяет Нейрум, 25=пересдать, 30=на проверке у учителя, 40=проверено */
  status: 10 | 20 | 25 | 30 | 40;
  estimate?: number;
  hasFiles?: boolean;
}

export interface SubjectInfo {
  id: number;
  name: string;
  color: string;
}

export const SUBJECTS: SubjectInfo[] = [
  { id: 1, name: "Алгебра", color: "#7457FE" },
  { id: 2, name: "Геометрия", color: "#3B82F6" },
  { id: 3, name: "Физика", color: "#F59E0B" },
  { id: 4, name: "Русский язык", color: "#0FBBA6" },
  { id: 5, name: "Английский", color: "#EC4899" },
];

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};

/** Просрочено = status 10 + deadlineAt < now */
export function isOverdue(hw: HomeworkItem): boolean {
  return hw.status === 10 && new Date(hw.deadlineAt) < new Date(new Date().setHours(0, 0, 0, 0));
}

/** Активное (не сдано, не проверено) */
export function isActive(hw: HomeworkItem): boolean {
  return hw.status === 10 || hw.status === 25;
}

/** Завершённое */
export function isDone(hw: HomeworkItem): boolean {
  return hw.status === 40;
}

export const HOMEWORK_LIST: HomeworkItem[] = [
  // --- Просроченные (status 10, deadline в прошлом) ---
  { id: 1, subject: "Алгебра", subjectId: 1, teacher: "Иванова А.П.", description: "Решить уравнения №1-15, стр. 42", createdAt: d(-10), deadlineAt: d(-3), status: 10 },
  { id: 2, subject: "Русский язык", subjectId: 4, teacher: "Петрова М.С.", description: "Сочинение на тему «Мой любимый герой»", createdAt: d(-8), deadlineAt: d(-2), status: 10 },
  { id: 3, subject: "Английский", subjectId: 5, teacher: "Смирнова Е.В.", description: "Workbook p.34-35, grammar exercises", createdAt: d(-7), deadlineAt: d(-1), status: 10 },

  // --- Сегодня ---
  { id: 4, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Лабораторная работа №7 «Измерение ускорения»", createdAt: d(-3), deadlineAt: d(0), status: 25 },
  { id: 5, subject: "Алгебра", subjectId: 1, teacher: "Иванова А.П.", description: "Параграф 15, задачи 1-8", createdAt: d(-2), deadlineAt: d(0), status: 10 },
  { id: 6, subject: "Геометрия", subjectId: 2, teacher: "Иванова А.П.", description: "Построение биссектрисы, задачи 4-9", createdAt: d(-5), deadlineAt: d(0), status: 20 },
  { id: 21, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Задачи на закон Ньютона, §12 упр. 3-7", createdAt: d(-4), deadlineAt: d(0), status: 30 },

  // --- Завтра ---
  { id: 7, subject: "Русский язык", subjectId: 4, teacher: "Петрова М.С.", description: "Упражнение 156, 157 — правописание приставок", createdAt: d(-1), deadlineAt: d(1), status: 10 },
  { id: 8, subject: "Английский", subjectId: 5, teacher: "Смирнова Е.В.", description: "Present Perfect exercises, Student's Book p.52", createdAt: d(-2), deadlineAt: d(1), status: 10 },
  { id: 9, subject: "Геометрия", subjectId: 2, teacher: "Иванова А.П.", description: "Доказать теорему о сумме углов треугольника", createdAt: d(-1), deadlineAt: d(1), status: 20 },

  // --- Эта неделя ---
  { id: 10, subject: "Алгебра", subjectId: 1, teacher: "Иванова А.П.", description: "Контрольная подготовка — вариант 3", createdAt: d(0), deadlineAt: d(3), status: 10 },
  { id: 11, subject: "Английский", subjectId: 5, teacher: "Смирнова Е.В.", description: "Write an essay: My Future Profession (150 words)", createdAt: d(-1), deadlineAt: d(4), status: 10 },
  { id: 12, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Параграф 18, ответить на вопросы", createdAt: d(0), deadlineAt: d(5), status: 10 },
  { id: 13, subject: "Русский язык", subjectId: 4, teacher: "Петрова М.С.", description: "Подготовить конспект по теме «Причастный оборот»", createdAt: d(0), deadlineAt: d(5), status: 10 },

  // --- Следующая неделя ---
  { id: 14, subject: "Геометрия", subjectId: 2, teacher: "Иванова А.П.", description: "Параллельные прямые — задачи 15-22", createdAt: d(0), deadlineAt: d(8), status: 10 },
  { id: 15, subject: "Алгебра", subjectId: 1, teacher: "Иванова А.П.", description: "Квадратные уравнения, §19 упр. 1-12", createdAt: d(0), deadlineAt: d(9), status: 10 },
  { id: 16, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Подготовить доклад о законе сохранения энергии", createdAt: d(1), deadlineAt: d(10), status: 10 },

  // --- Проверенные ---
  { id: 17, subject: "Алгебра", subjectId: 1, teacher: "Иванова А.П.", description: "Домашняя контрольная — вариант 1", createdAt: d(-14), deadlineAt: d(-7), status: 40, estimate: 5, hasFiles: true },
  { id: 18, subject: "Русский язык", subjectId: 4, teacher: "Петрова М.С.", description: "Изложение по тексту Паустовского", createdAt: d(-12), deadlineAt: d(-5), status: 40, estimate: 4, hasFiles: true },
  { id: 19, subject: "Физика", subjectId: 3, teacher: "Козлов Д.И.", description: "Лабораторная работа №6", createdAt: d(-15), deadlineAt: d(-8), status: 40, estimate: 5, hasFiles: true },
  { id: 20, subject: "Геометрия", subjectId: 2, teacher: "Иванова А.П.", description: "Площадь треугольника — контрольная", createdAt: d(-11), deadlineAt: d(-4), status: 40, estimate: 3, hasFiles: true },
];
