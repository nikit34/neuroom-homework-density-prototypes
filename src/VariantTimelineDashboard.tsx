import { useState, useMemo } from "react";
import { HOMEWORK_LIST, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant 2+4: Timeline by Date + Compact Dashboard Summary ── */

interface VariantTimelineDashboardProps {
  selectedSubjectId?: number | null;
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

export default function VariantTimelineDashboard({
  selectedSubjectId = null,
}: VariantTimelineDashboardProps) {
  const [showDone, setShowDone] = useState(false);
  const visibleHomework = useMemo(
    () =>
      selectedSubjectId === null
        ? HOMEWORK_LIST
        : HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId),
    [selectedSubjectId],
  );

  const stats = useMemo(() => {
    const active = visibleHomework.filter((h) => h.status !== "done");
    return {
      newCount: active.filter((h) => h.status === "new").length,
      overdue: active.filter((h) => h.status === "missed").length,
      resend: active.filter((h) => h.status === "resend").length,
      inReview: active.filter((h) => h.status === "in_review" || h.status === "checked").length,
      doneCount: visibleHomework.filter((h) => h.status === "done").length,
    };
  }, [visibleHomework]);

  const dateGroups = useMemo(() => {
    const list = visibleHomework.filter((h) => (showDone ? true : h.status !== "done"));
    const map = new Map<string, { label: string; date: Date; items: HomeworkItem[] }>();
    for (const hw of list) {
      const key = formatDateKey(hw.deadlineAt);
      if (!map.has(key)) {
        map.set(key, { label: formatDateLabel(hw.deadlineAt), date: new Date(hw.deadlineAt), items: [] });
      }
      map.get(key)!.items.push(hw);
    }
    return [...map.entries()].sort((a, b) => a[1].date.getTime() - b[1].date.getTime());
  }, [showDone, visibleHomework]);

  return (
    <div className="variant">
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

      <button className="toggle-done" onClick={() => setShowDone(!showDone)}>
        {showDone ? "Скрыть сданные" : `Показать сданные (${stats.doneCount})`}
      </button>

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
                {group.items.map((hw) => (
                  <HwCard key={hw.id} hw={hw} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
