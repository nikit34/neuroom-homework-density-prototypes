import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, isOverdue, type HomeworkItem } from "./mockData";

/* ── Variant: Calendar Week ──
   Один календарь на все предметы.
   Строки = дни недели, в каждом дне — список ДЗ с цветной меткой предмета.
*/

interface VariantCalendarWeekProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function statusBadge(hw: HomeworkItem): { text: string; cls: string } {
  if (isOverdue(hw)) return { text: "Просрочено", cls: "cal3-badge--missed" };
  switch (hw.status) {
    case 40: return { text: hw.estimate ? `Оценка: ${hw.estimate}` : "Проверено", cls: "cal3-badge--done" };
    case 25: return { text: "Пересдать", cls: "cal3-badge--resend" };
    case 20: return { text: "Нейрум", cls: "cal3-badge--neuroom" };
    case 30: return { text: "На проверке", cls: "cal3-badge--review" };
    default: return { text: "Не сдано", cls: "cal3-badge--new" };
  }
}

export default function VariantCalendarWeek({ selectedSubjectId = null, onSelect }: VariantCalendarWeekProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => addDays(getWeekStart(new Date()), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekEnd = weekDays[6];

  const homework = useMemo(() => {
    if (selectedSubjectId === null) return HOMEWORK_LIST;
    return HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);
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

  return (
    <div className="variant">
      {/* Nav */}
      <div className="cal2-nav">
        <button className="cal2-nav__btn" onClick={() => setWeekOffset((o) => o - 1)} type="button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="cal2-nav__label">
          {formatShortDate(weekStart)} – {formatShortDate(weekEnd)}
        </span>
        <button className="cal2-nav__btn" onClick={() => setWeekOffset((o) => o + 1)} type="button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Days */}
      <div className="cal3-days">
        {weekDays.map((day) => {
          const dk = dateKey(day);
          const items = hwByDate.get(dk) ?? [];
          const today = isToday(day);
          const weekday = day.toLocaleDateString("ru-RU", { weekday: "long" });
          const dayNum = day.getDate();
          const month = day.toLocaleDateString("ru-RU", { month: "short" });

          return (
            <div key={dk} className={`cal3-day ${today ? "cal3-day--today" : ""}`}>
              <div className="cal3-day__header">
                <span className="cal3-day__weekday">{weekday}</span>
                <span className={`cal3-day__date ${today ? "cal3-day__date--today" : ""}`}>{dayNum} {month}</span>
                {items.length > 0 && <span className="cal3-day__count">{items.length}</span>}
              </div>

              {items.length === 0 ? (
                <div className="cal3-empty">Нет заданий</div>
              ) : (
                <div className="cal3-items">
                  {items.map((hw) => {
                    const badge = statusBadge(hw);
                    return (
                      <div
                        key={hw.id}
                        className="cal3-item"
                        onClick={() => onSelect?.(hw)}
                      >
                        <div className="cal3-item__bar" style={{ background: subjectColor(hw.subjectId) }} />
                        <div className="cal3-item__body">
                          <div className="cal3-item__top">
                            <span className="cal3-item__subject">{hw.subject}</span>
                            <span className={`cal3-badge ${badge.cls}`}>{badge.text}</span>
                          </div>
                          <span className="cal3-item__desc">{hw.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
