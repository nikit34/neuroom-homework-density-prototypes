import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant: Priority Inbox ──
   Секции по срочности, а не по статусу.
   Карточка: текст сверху, предмет • учитель ниже, дедлайн справа заметно,
   createdAt — мелкий вторичный текст.
*/

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff === 1) return "Вчера";
    return `${absDiff} дн. назад`;
  }
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatCreated(dateStr: string): string {
  const d = new Date(dateStr);
  return `задано ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`;
}

interface PriorityGroup {
  key: string;
  title: string;
  icon: string;
  variant: "overdue" | "urgent" | "resend" | "review" | "week" | "later" | "done";
  items: HomeworkItem[];
}

function classifyIntoGroups(list: HomeworkItem[]): PriorityGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const overdue: HomeworkItem[] = [];
  const todayTomorrow: HomeworkItem[] = [];
  const resend: HomeworkItem[] = [];
  const inReview: HomeworkItem[] = [];
  const thisWeek: HomeworkItem[] = [];
  const later: HomeworkItem[] = [];
  const done: HomeworkItem[] = [];

  for (const hw of list) {
    if (hw.status === "done") {
      done.push(hw);
      continue;
    }

    const deadline = new Date(hw.deadlineAt);
    const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

    // Пересдача — отдельная секция независимо от дедлайна
    if (hw.status === "resend") {
      resend.push(hw);
      continue;
    }

    // На проверке — отдельная секция
    if (hw.status === "in_review") {
      inReview.push(hw);
      continue;
    }

    // По сроку
    if (diff < 0) {
      overdue.push(hw);
    } else if (diff <= 1) {
      todayTomorrow.push(hw);
    } else if (diff <= 7) {
      thisWeek.push(hw);
    } else {
      later.push(hw);
    }
  }

  const groups: PriorityGroup[] = [];

  if (overdue.length > 0) {
    groups.push({ key: "overdue", title: "Просрочено", icon: "!", variant: "overdue", items: overdue });
  }
  if (todayTomorrow.length > 0) {
    groups.push({ key: "urgent", title: "Сдать сегодня / завтра", icon: "⏰", variant: "urgent", items: todayTomorrow });
  }
  if (resend.length > 0) {
    groups.push({ key: "resend", title: "Требует пересдачи", icon: "↩", variant: "resend", items: resend });
  }
  if (inReview.length > 0) {
    groups.push({ key: "review", title: "На проверке", icon: "⏳", variant: "review", items: inReview });
  }
  if (thisWeek.length > 0) {
    groups.push({ key: "week", title: "На этой неделе", icon: "📅", variant: "week", items: thisWeek });
  }
  if (later.length > 0) {
    groups.push({ key: "later", title: "Позже", icon: "📌", variant: "later", items: later });
  }
  if (done.length > 0) {
    groups.push({ key: "done", title: "Сданные", icon: "✓", variant: "done", items: done });
  }

  return groups;
}

export default function VariantPriorityInbox() {
  const groups = useMemo(() => classifyIntoGroups(HOMEWORK_LIST), []);

  return (
    <div className="variant">
      {groups.map((group) => (
        <div key={group.key} className="pi-section">
          <div className={`pi-section__header pi-section__header--${group.variant}`}>
            <span className="pi-section__title">{group.title}</span>
            <span className="pi-section__count">{group.items.length}</span>
          </div>

          <div className="pi-section__list">
            {group.items.map((hw) => (
              <div key={hw.id} className={`pi-card ${group.variant === "done" ? "pi-card--done" : ""}`}>
                <div className="pi-card__color" style={{ background: subjectColor(hw.subjectId) }} />
                <div className="pi-card__body">
                  <div className="pi-card__desc">{hw.description}</div>
                  <div className="pi-card__meta">
                    <span className="pi-card__subject">{hw.subject}</span>
                    <span className="pi-card__sep">&middot;</span>
                    <span className="pi-card__teacher">{hw.teacher}</span>
                  </div>
                  <div className="pi-card__created">{formatCreated(hw.createdAt)}</div>
                </div>
                <div className="pi-card__right">
                  {group.variant === "done" && hw.estimate ? (
                    <span className="pi-card__estimate">{hw.estimate}</span>
                  ) : (
                    <span className={`pi-card__deadline pi-card__deadline--${group.variant}`}>
                      {formatDeadline(hw.deadlineAt)}
                    </span>
                  )}
                  <svg className="pi-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
