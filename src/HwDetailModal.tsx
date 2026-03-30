import { SUBJECTS, type HomeworkItem } from "./mockData";
import iconCalendar from "./assets/icon-calendar.svg";
import iconAttach from "./assets/icon-attach.svg";
import iconChat from "./assets/icon-chat.svg";

interface HwDetailModalProps {
  hw: HomeworkItem;
  onClose: () => void;
}

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: HomeworkItem["status"]): { text: string; cls: string } {
  switch (status) {
    case "missed": return { text: "Просрочено", cls: "detail-status--missed" };
    case "resend": return { text: "Пересдать", cls: "detail-status--resend" };
    case "checked": return { text: "Проверено Нейрумом", cls: "detail-status--checked" };
    case "in_review": return { text: "На проверке", cls: "detail-status--review" };
    case "done": return { text: "Сдано", cls: "detail-status--done" };
    default: return { text: "Новое", cls: "detail-status--new" };
  }
}

export default function HwDetailModal({ hw, onClose }: HwDetailModalProps) {
  const status = statusLabel(hw.status);
  const color = subjectColor(hw.subjectId);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div className="detail-header">
          <button className="detail-back" onClick={onClose} type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="detail-header__title">Задание</span>
          <span className={`detail-status ${status.cls}`}>{status.text}</span>
        </div>

        {/* Subject */}
        <div className="detail-subject">
          <span className="detail-subject__dot" style={{ background: color }} />
          <span className="detail-subject__name">{hw.subject}</span>
          <span className="detail-subject__teacher">{hw.teacher}</span>
        </div>

        {/* Description */}
        <div className="detail-desc">{hw.description}</div>

        {/* Dates */}
        <div className="detail-dates">
          <div className="detail-date-row">
            <img className="detail-date-icon" src={iconCalendar} alt="" />
            <span className="detail-date-label">Срок сдачи:</span>
            <span className="detail-date-value">{formatDate(hw.deadlineAt)}</span>
          </div>
          <div className="detail-date-row">
            <img className="detail-date-icon" src={iconCalendar} alt="" />
            <span className="detail-date-label">Задано:</span>
            <span className="detail-date-value">{formatDate(hw.createdAt)}</span>
          </div>
        </div>

        {/* Grade */}
        {hw.status === "done" && hw.estimate && (
          <div className="detail-grade">
            <span className="detail-grade__label">Оценка</span>
            <span className="detail-grade__value">{hw.estimate}</span>
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          {hw.status !== "done" && hw.status !== "in_review" && hw.status !== "checked" && (
            <button className="detail-btn detail-btn--primary" type="button">Сдать задание</button>
          )}
          <div className="detail-actions__row">
            <button className="detail-btn detail-btn--secondary" type="button">
              <img src={iconAttach} alt="" className="detail-btn__icon" />
              Вложения
            </button>
            <button className="detail-btn detail-btn--secondary" type="button">
              <img src={iconChat} alt="" className="detail-btn__icon" />
              Комментарии
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
