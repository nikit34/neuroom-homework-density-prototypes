import { useState, useMemo } from "react";
import { HOMEWORK_LIST, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant: Timeline ── */

interface VariantTimelineDashboardProps {
  onSelect?: (hw: HomeworkItem) => void;
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
  onSelect,
}: VariantTimelineDashboardProps) {
  const [showDone, setShowDone] = useState(false);

  const doneCount = useMemo(
    () => HOMEWORK_LIST.filter((h) => h.status === "done").length,
    [],
  );

  const dateGroups = useMemo(() => {
    const list = HOMEWORK_LIST.filter((h) => (showDone ? true : h.status !== "done"));
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
      <button className="toggle-done" onClick={() => setShowDone(!showDone)} type="button">
        {showDone ? "Скрыть сданные" : `Показать сданные (${doneCount})`}
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
                  <HwCard key={hw.id} hw={hw} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
