import { isOverdue, type HomeworkItem } from "./mockData";
import iconAlarm from "./assets/icon-alarm.svg";
import iconAttach from "./assets/icon-attach.svg";
import iconCalendar from "./assets/icon-calendar.svg";
import iconChat from "./assets/icon-chat.svg";
import iconWaiting from "./assets/icon-waiting.svg";

interface HwCardProps {
  hw: HomeworkItem;
  hideSubject?: boolean;
  onSelect?: (hw: HomeworkItem) => void;
}

type CardTone = "active" | "waiting" | "score" | "checked";

interface CardViewModel {
  tone: CardTone;
  badgeText?: string;
  badgeVariant?: "deadline" | "waiting" | "checked";
  badgeIcon?: string;
  score?: number;
}

function formatRussianDayLabel(days: number): string {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return "день";
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "дня";
  }

  return "дней";
}

function formatRemainingTime(dateStr: string): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadline = new Date(dateStr);
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return "Просрочено";
  if (diff === 0) return "Сдать сегодня";
  if (diff === 1) return "Остался 1 день";
  return `Осталось ${diff} ${formatRussianDayLabel(diff)}`;
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function getCardViewModel(hw: HomeworkItem): CardViewModel {
  // 40 = Проверено
  if (hw.status === 40) {
    if (typeof hw.estimate === "number") {
      return { tone: "score", score: hw.estimate };
    }
    return { tone: "checked", badgeText: "Проверено", badgeVariant: "checked" };
  }

  // 30 = На проверке у учителя
  if (hw.status === 30) {
    return { tone: "waiting", badgeText: "На проверке", badgeVariant: "waiting", badgeIcon: iconWaiting };
  }

  // 20 = Проверяет Нейрум
  if (hw.status === 20) {
    return { tone: "waiting", badgeText: "Проверяет Нейрум", badgeVariant: "waiting", badgeIcon: iconWaiting };
  }

  // 25 = Пересдать
  if (hw.status === 25) {
    return { tone: "active", badgeText: "Пересдать", badgeVariant: "deadline", badgeIcon: iconAlarm };
  }

  // 10 = Не сдано (+ проверяем просрочку по дедлайну)
  if (isOverdue(hw)) {
    return { tone: "active", badgeText: "Просрочено", badgeVariant: "deadline", badgeIcon: iconAlarm };
  }

  return { tone: "active", badgeText: formatRemainingTime(hw.deadlineAt), badgeVariant: "deadline", badgeIcon: iconAlarm };
}

export default function HwCard({ hw, hideSubject = false, onSelect }: HwCardProps) {
  const cardView = getCardViewModel(hw);

  return (
    <article className={`hwc hwc--tone-${cardView.tone}`} onClick={() => onSelect?.(hw)} style={{ cursor: onSelect ? "pointer" : undefined }}>
      <div className="hwc__body">
        <div className="hwc__top">
          <span className="hwc__checkbox" aria-hidden="true" />

          {cardView.tone === "score" ? (
            <div className="hwc__score-meta">
              <span className="hwc__score-label">Твоя оценка</span>
              <span className="hwc__score-badge">{cardView.score}</span>
            </div>
          ) : (
            cardView.badgeText && (
              <span className={`hwc__pill hwc__pill--${cardView.badgeVariant}`}>
                {cardView.badgeIcon ? (
                  <img className="hwc__pill-icon" src={cardView.badgeIcon} alt="" />
                ) : null}
                <span>{cardView.badgeText}</span>
              </span>
            )
          )}
        </div>

        <div className="hwc__content">
          {!hideSubject ? <h3 className="hwc__subject">{hw.subject}</h3> : null}
          <p className="hwc__desc">{hw.description}</p>
        </div>

        <div className="hwc__deadline">
          <img className="hwc__deadline-icon" src={iconCalendar} alt="" />
          <span className="hwc__deadline-label">Срок сдачи:</span>
          <span className="hwc__deadline-value">{formatDeadline(hw.deadlineAt)}</span>
        </div>

        <div className="hwc__actions">
          <button className="hwc__primary" type="button">
            Открыть задание
          </button>
          <button className="hwc__icon-button" type="button" aria-label="Open attachments">
            <img className="hwc__action-icon" src={iconAttach} alt="" />
          </button>
          <button className="hwc__icon-button" type="button" aria-label="Open comments">
            <img className="hwc__action-icon" src={iconChat} alt="" />
          </button>
        </div>
      </div>
    </article>
  );
}
