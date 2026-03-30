import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, isOverdue, type HomeworkItem } from "./mockData";

/* ── Variant: Matrix (Date × Subject) ──
   Строки = дни, колонки = предметы.
   Оптимальный набор ДЗ подсвечивается зелёной пульсацией.
*/

interface VariantMatrixProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

function getDays(): Date[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = -3; i <= 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatDayRow(d: Date): { weekday: string; num: string } {
  return {
    weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }),
    num: String(d.getDate()),
  };
}

function statusClass(hw: HomeworkItem): string {
  if (isOverdue(hw)) return "mtx2--missed";
  switch (hw.status) {
    case 25: return "mtx2--resend";
    case 40: return "mtx2--done";
    case 20: return "mtx2--neuroom";
    case 30: return "mtx2--review";
    default: return "mtx2--new";
  }
}

function statusEmoji(hw: HomeworkItem): string {
  if (isOverdue(hw)) return "!";
  switch (hw.status) {
    case 25: return "↩";
    case 40: return hw.estimate ? String(hw.estimate) : "✓";
    case 20: return "◎";
    case 30: return "…";
    default: return "●";
  }
}

/** Оптимальный набор: просроченные + пересдачи + ближайшие по дедлайну (до 5 штук) */
function getOptimalIds(list: HomeworkItem[]): Set<number> {
  const actionable = list.filter((hw) => hw.status === 10 || hw.status === 25);

  const scored = actionable.map((hw) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadline = new Date(hw.deadlineAt);
    const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const dayDiff = Math.floor((target.getTime() - today.getTime()) / 86400000);

    let score = 0;
    if (isOverdue(hw)) score += 100;
    if (hw.status === 25) score += 80;
    score += Math.max(0, 14 - dayDiff);

    return { id: hw.id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return new Set(scored.slice(0, 5).map((s) => s.id));
}

export default function VariantMatrix({ selectedSubjectId = null, onSelect }: VariantMatrixProps) {
  const days = useMemo(getDays, []);

  const homework = useMemo(() => {
    if (selectedSubjectId === null) return HOMEWORK_LIST;
    return HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  const activeSubjects = useMemo(() => {
    const ids = new Set(homework.map((hw) => hw.subjectId));
    return SUBJECTS.filter((s) => ids.has(s.id));
  }, [homework]);

  const matrix = useMemo(() => {
    const map = new Map<string, HomeworkItem[]>();
    for (const hw of homework) {
      const d = new Date(hw.deadlineAt);
      const key = `${dateKey(d)}:${hw.subjectId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(hw);
    }
    return map;
  }, [homework]);

  const optimalIds = useMemo(() => getOptimalIds(homework), [homework]);

  return (
    <div className="variant">
      <div className="mtx2-table">
        {/* Header */}
        <div className="mtx2-header">
          <div className="mtx2-header__corner" />
          {activeSubjects.map((subj) => (
            <div key={subj.id} className="mtx2-header__subj">
              <span className="mtx2-header__dot" style={{ background: subj.color }} />
              <span className="mtx2-header__name">{subj.name}</span>
            </div>
          ))}
        </div>

        {/* Day rows */}
        {days.map((day) => {
          const dk = dateKey(day);
          const today = isToday(day);
          const fmt = formatDayRow(day);

          return (
            <div key={dk} className={`mtx2-row ${today ? "mtx2-row--today" : ""}`}>
              <div className="mtx2-row__day">
                <span className="mtx2-row__weekday">{fmt.weekday}</span>
                <span className={`mtx2-row__num ${today ? "mtx2-row__num--today" : ""}`}>{fmt.num}</span>
              </div>
              {activeSubjects.map((subj) => {
                const items = matrix.get(`${dk}:${subj.id}`) ?? [];
                return (
                  <div key={subj.id} className="mtx2-cell">
                    {items.map((hw) => {
                      const isOptimal = optimalIds.has(hw.id);
                      return (
                        <button
                          key={hw.id}
                          className={`mtx2-pip ${statusClass(hw)} ${isOptimal ? "mtx2-pip--optimal" : ""}`}
                          onClick={() => onSelect?.(hw)}
                          type="button"
                          title={hw.description}
                        >
                          {statusEmoji(hw)}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mtx2-legend">
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2--new">●</span> Не сдано</span>
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2--missed">!</span> Просрочено</span>
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2--neuroom">◎</span> Нейрум</span>
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2--review">…</span> Учитель</span>
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2--resend">↩</span> Пересдать</span>
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2--done">✓</span> Проверено</span>
        <span className="mtx2-legend__item"><span className="mtx2-pip mtx2-pip--optimal-demo">★</span> Сделай сейчас</span>
      </div>
    </div>
  );
}
