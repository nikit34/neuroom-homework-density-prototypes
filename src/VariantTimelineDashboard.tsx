import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant 2+4: Timeline by Date + Compact Dashboard Summary ── */

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function formatDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  if (diff === -1) return "Вчера";

  const weekday = d.toLocaleDateString("ru-RU", { weekday: "short" });
  const dayMonth = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  return `${weekday}, ${dayMonth}`;
}

function statusBadge(status: HomeworkItem["status"]): { text: string; cls: string } | null {
  switch (status) {
    case "in_review": return { text: "Проверка", cls: "badge--primary" };
    case "resend": return { text: "Пересдай", cls: "badge--error" };
    case "missed": return { text: "Просрочено", cls: "badge--error" };
    case "done": return { text: "Сдано", cls: "badge--success" };
    default: return null;
  }
}

export default function VariantTimelineDashboard() {
  const [showDone, setShowDone] = useState(false);

  // Dashboard counters
  const stats = useMemo(() => {
    const active = HOMEWORK_LIST.filter((h) => h.status !== "done");
    return {
      total: active.length,
      newCount: active.filter((h) => h.status === "new").length,
      overdue: active.filter((h) => h.status === "missed").length,
      resend: active.filter((h) => h.status === "resend").length,
      inReview: active.filter((h) => h.status === "in_review").length,
      doneCount: HOMEWORK_LIST.filter((h) => h.status === "done").length,
    };
  }, []);

  // Group by exact deadline date, sorted chronologically
  const dateGroups = useMemo(() => {
    const list = HOMEWORK_LIST.filter((h) => (showDone ? true : h.status !== "done"));
    const map = new Map<string, { label: string; date: Date; items: HomeworkItem[] }>();
    for (const hw of list) {
      const key = formatDateKey(hw.deadlineAt);
      if (!map.has(key)) {
        map.set(key, {
          label: formatDateLabel(hw.deadlineAt),
          date: new Date(hw.deadlineAt),
          items: [],
        });
      }
      map.get(key)!.items.push(hw);
    }
    return [...map.entries()].sort((a, b) => a[1].date.getTime() - b[1].date.getTime());
  }, [showDone]);

  return (
    <div className="variant">
      {/* Dashboard Summary Cards */}
      <div className="dashboard">
        <div className="dash-card dash-card--new">
          <div className="dash-card__num">{stats.newCount}</div>
          <div className="dash-card__label">Новых</div>
        </div>
        <div className="dash-card dash-card--overdue">
          <div className="dash-card__num">{stats.overdue}</div>
          <div className="dash-card__label">Долги</div>
        </div>
        <div className="dash-card dash-card--resend">
          <div className="dash-card__num">{stats.resend}</div>
          <div className="dash-card__label">Пересдача</div>
        </div>
        <div className="dash-card dash-card--review">
          <div className="dash-card__num">{stats.inReview}</div>
          <div className="dash-card__label">Проверка</div>
        </div>
      </div>

      {/* Toggle done */}
      <button className="toggle-done" onClick={() => setShowDone(!showDone)}>
        {showDone ? "Скрыть сданные" : `Показать сданные (${stats.doneCount})`}
      </button>

      {/* Timeline */}
      <div className="timeline">
        {dateGroups.map(([key, group]) => {
          const isOverdue = group.date < new Date(new Date().setHours(0, 0, 0, 0));
          const isToday = formatDateLabel(group.date.toISOString()) === "Сегодня";

          return (
            <div key={key} className="timeline-group">
              <div className={`timeline-date ${isOverdue ? "timeline-date--overdue" : ""} ${isToday ? "timeline-date--today" : ""}`}>
                <div className="timeline-date__dot" />
                <span className="timeline-date__text">{group.label}</span>
                <span className="timeline-date__count">{group.items.length}</span>
              </div>

              <div className="timeline-items">
                {group.items.map((hw) => {
                  const badge = statusBadge(hw.status);
                  const isDone = hw.status === "done";

                  return (
                    <div key={hw.id} className={`compact-row ${isDone ? "compact-row--done" : ""}`}>
                      <div className="compact-row__left">
                        <div className="compact-row__dot" style={{ background: subjectColor(hw.subjectId) }} />
                        <span className="compact-row__subject">{hw.subject}</span>
                        {badge && <span className={`compact-row__badge ${badge.cls}`}>{badge.text}</span>}
                        {isDone && hw.estimate && (
                          <span className="compact-row__estimate">{hw.estimate}</span>
                        )}
                      </div>
                      <svg className="compact-row__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L10 8L6 12" stroke="#272443" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                      </svg>
                      <div className="compact-row__desc">{hw.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
