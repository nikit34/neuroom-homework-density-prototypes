import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant: Calendar Week ──
   Недельная сетка. Дни недели = колонки, в каждой ячейке — точки/мини-карточки ДЗ.
   Просроченные — отдельная строка сверху.
*/

interface VariantCalendarWeekProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function getWeekDays(): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayName(d: Date): string {
  return d.toLocaleDateString("ru-RU", { weekday: "short" });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function statusDot(status: HomeworkItem["status"]): string {
  switch (status) {
    case "missed": return "cal-dot--missed";
    case "resend": return "cal-dot--resend";
    case "checked": return "cal-dot--checked";
    case "in_review": return "cal-dot--review";
    case "done": return "cal-dot--done";
    default: return "";
  }
}

export default function VariantCalendarWeek({ selectedSubjectId = null, onSelect }: VariantCalendarWeekProps) {
  const days = useMemo(getWeekDays, []);

  const homework = useMemo(() => {
    let list = HOMEWORK_LIST;
    if (selectedSubjectId !== null) list = list.filter((hw) => hw.subjectId === selectedSubjectId);
    return list;
  }, [selectedSubjectId]);

  const hwByDate = useMemo(() => {
    const map = new Map<string, HomeworkItem[]>();
    for (const hw of homework) {
      const d = new Date(hw.deadlineAt);
      const key = dateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(hw);
    }
    return map;
  }, [homework]);

  const overdue = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return homework.filter((hw) => {
      const d = new Date(hw.deadlineAt);
      d.setHours(0, 0, 0, 0);
      return d < now && hw.status !== "done";
    });
  }, [homework]);

  // Split into 2 weeks
  const week1 = days.slice(0, 7);
  const week2 = days.slice(7, 14);

  return (
    <div className="variant">
      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="cal-overdue-banner">
          <span className="cal-overdue-banner__label">Просрочено</span>
          <span className="cal-overdue-banner__count">{overdue.length}</span>
          <div className="cal-overdue-banner__items">
            {overdue.map((hw) => (
              <div key={hw.id} className="cal-overdue-item" style={{ borderLeftColor: subjectColor(hw.subjectId), cursor: "pointer" }} onClick={() => onSelect?.(hw)}>
                <span className="cal-overdue-item__subject">{hw.subject}</span>
                <span className="cal-overdue-item__desc">{hw.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week grid */}
      {[week1, week2].map((week, wi) => (
        <div key={wi} className="cal-week">
          <div className="cal-week__label">{wi === 0 ? "Эта неделя" : "Следующая"}</div>
          <div className="cal-grid">
            {week.map((day) => {
              const key = dateKey(day);
              const items = hwByDate.get(key) ?? [];
              const today = isToday(day);

              return (
                <div key={key} className={`cal-cell ${today ? "cal-cell--today" : ""}`}>
                  <div className="cal-cell__header">
                    <span className="cal-cell__day">{formatDayName(day)}</span>
                    <span className={`cal-cell__num ${today ? "cal-cell__num--today" : ""}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="cal-cell__dots">
                    {items.map((hw) => (
                      <div
                        key={hw.id}
                        className={`cal-dot ${statusDot(hw.status)}`}
                        style={{ background: subjectColor(hw.subjectId), cursor: "pointer" }}
                        title={`${hw.subject}: ${hw.description}`}
                        onClick={() => onSelect?.(hw)}
                      />
                    ))}
                  </div>
                  {items.length > 0 && (
                    <div className="cal-cell__mini-list">
                      {items.slice(0, 2).map((hw) => (
                        <div key={hw.id} className="cal-mini" style={{ borderLeftColor: subjectColor(hw.subjectId), cursor: "pointer" }} onClick={() => onSelect?.(hw)}>
                          <span className="cal-mini__text">{hw.subject}</span>
                        </div>
                      ))}
                      {items.length > 2 && (
                        <span className="cal-cell__more">+{items.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
