import { SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Единая карточка ДЗ для всех вариантов ──
   Формат:
   1. Предмет (цветная полоска + название)
   2. Срок «до 28 марта»
   3. Первые 2 строки задания
   4. Статус (просрочено, проверено Нейрумом, на проверке, пересдай, оценка)
*/

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function formatDeadlineDo(dateStr: string): string {
  const d = new Date(dateStr);
  return `до ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
}

interface StatusInfo {
  text: string;
  cls: string;
}

function getStatus(hw: HomeworkItem): StatusInfo {
  switch (hw.status) {
    case "missed":    return { text: "Просрочено", cls: "hwc-status--missed" };
    case "resend":    return { text: "Пересдай", cls: "hwc-status--resend" };
    case "checked":   return { text: "Проверено Нейрумом", cls: "hwc-status--checked" };
    case "in_review": return { text: "На проверке", cls: "hwc-status--review" };
    case "done":      return { text: hw.estimate ? `Оценка: ${hw.estimate}` : "Сдано", cls: "hwc-status--done" };
    case "new":
    default:          return { text: "Новое", cls: "hwc-status--new" };
  }
}

interface HwCardProps {
  hw: HomeworkItem;
  /** Не показывать предмет (если уже понятен из контекста, напр. Subject-First) */
  hideSubject?: boolean;
}

export default function HwCard({ hw, hideSubject }: HwCardProps) {
  const status = getStatus(hw);
  const color = subjectColor(hw.subjectId);

  return (
    <div className={`hwc ${hw.status === "done" ? "hwc--done" : ""}`}>
      <div className="hwc__bar" style={{ background: color }} />
      <div className="hwc__body">
        {/* Строка 1: предмет + срок */}
        <div className="hwc__top">
          {!hideSubject && <span className="hwc__subject" style={{ color }}>{hw.subject}</span>}
          <span className="hwc__deadline">{formatDeadlineDo(hw.deadlineAt)}</span>
        </div>

        {/* Строка 2-3: описание, макс 2 строки */}
        <div className="hwc__desc">{hw.description}</div>

        {/* Строка 4: статус + оценка */}
        <div className="hwc__bottom">
          <span className={`hwc__status ${status.cls}`}>{status.text}</span>
          {hw.status === "done" && hw.estimate && (
            <span className="hwc__grade">{hw.estimate}</span>
          )}
        </div>
      </div>
      <svg className="hwc__arrow" width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
