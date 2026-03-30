import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, isOverdue, type HomeworkItem } from "./mockData";

/* ── Variant: Calendar Week (Journal-style) ──
   Навигация по неделям ← / →
   Строки = предметы, колонки = будние дни (Пн-Пт)
   Ячейки: статус ДЗ в виде цветных плиток
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

function formatDayLabel(d: Date): string {
  const weekday = d.toLocaleDateString("ru-RU", { weekday: "short" });
  return `${weekday} ${d.getDate()}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function statusCell(hw: HomeworkItem): { label: string; cls: string } {
  if (isOverdue(hw)) return { label: "!", cls: "cal2-cell--missed" };
  switch (hw.status) {
    case 40: return { label: hw.estimate ? String(hw.estimate) : "✓", cls: "cal2-cell--done" };
    case 25: return { label: "↩", cls: "cal2-cell--resend" };
    case 20: return { label: "◎", cls: "cal2-cell--neuroom" };
    case 30: return { label: "…", cls: "cal2-cell--review" };
    default: return { label: "●", cls: "cal2-cell--new" };
  }
}

export default function VariantCalendarWeek({ selectedSubjectId = null, onSelect }: VariantCalendarWeekProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => addDays(getWeekStart(new Date()), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekEnd = weekDays[4];

  const homework = useMemo(() => {
    let list = HOMEWORK_LIST;
    if (selectedSubjectId !== null) list = list.filter((hw) => hw.subjectId === selectedSubjectId);
    return list;
  }, [selectedSubjectId]);

  const hwMap = useMemo(() => {
    const map = new Map<string, HomeworkItem[]>();
    for (const hw of homework) {
      const d = new Date(hw.deadlineAt);
      const key = `${hw.subjectId}:${dateKey(d)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(hw);
    }
    return map;
  }, [homework]);

  const activeSubjects = useMemo(() => {
    const ids = new Set(homework.map((hw) => hw.subjectId));
    return SUBJECTS.filter((s) => ids.has(s.id));
  }, [homework]);

  const subjectWeekCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const subj of activeSubjects) {
      let count = 0;
      for (const day of weekDays) {
        const items = hwMap.get(`${subj.id}:${dateKey(day)}`) ?? [];
        count += items.length;
      }
      counts.set(subj.id, count);
    }
    return counts;
  }, [activeSubjects, weekDays, hwMap]);

  return (
    <div className="variant">
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

      <div className="cal2-rows">
        {activeSubjects.map((subj) => {
          const weekCount = subjectWeekCount.get(subj.id) ?? 0;
          return (
            <div key={subj.id} className="cal2-row">
              <div className="cal2-row__header">
                <span className="cal2-row__dot" style={{ background: subj.color }} />
                <span className="cal2-row__name">{subj.name}</span>
                {weekCount > 0 && <span className="cal2-row__count">{weekCount}</span>}
              </div>
              <div className="cal2-row__days">
                {weekDays.map((day) => {
                  const key = `${subj.id}:${dateKey(day)}`;
                  const items = hwMap.get(key) ?? [];
                  const today = isToday(day);
                  return (
                    <div key={dateKey(day)} className={`cal2-day ${today ? "cal2-day--today" : ""}`}>
                      <span className="cal2-day__label">{formatDayLabel(day)}</span>
                      <div className="cal2-day__cells">
                        {items.length === 0 && <div className="cal2-cell cal2-cell--empty">—</div>}
                        {items.map((hw) => {
                          const st = statusCell(hw);
                          return (
                            <div key={hw.id} className={`cal2-cell ${st.cls}`} onClick={() => onSelect?.(hw)}>
                              {st.label}
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
        })}
      </div>

      {activeSubjects.length === 0 && (
        <div className="empty-state">Нет заданий на эту неделю</div>
      )}
    </div>
  );
}
