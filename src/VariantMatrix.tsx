import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant: Matrix (Subject × Date) ──
   Таблица: строки = предметы, колонки = дни. В ячейках — точки/числа.
   Даёт bird's eye view: где скопление, где пусто.
*/

interface VariantMatrixProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

function getNext10Days(): Date[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = -3; i <= 7; i++) {
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

function statusIndicator(hw: HomeworkItem): string {
  switch (hw.status) {
    case "missed": return "mtx-cell--missed";
    case "resend": return "mtx-cell--resend";
    case "done": return "mtx-cell--done";
    case "checked": return "mtx-cell--checked";
    case "in_review": return "mtx-cell--review";
    default: return "mtx-cell--new";
  }
}

export default function VariantMatrix({ selectedSubjectId = null, onSelect }: VariantMatrixProps) {
  const days = useMemo(getNext10Days, []);

  const homework = useMemo(() => {
    if (selectedSubjectId === null) return HOMEWORK_LIST;
    return HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  const activeSubjects = useMemo(() => {
    const ids = new Set(homework.map((hw) => hw.subjectId));
    return SUBJECTS.filter((s) => ids.has(s.id));
  }, [homework]);

  // Build lookup: subjectId -> dateKey -> HomeworkItem[]
  const matrix = useMemo(() => {
    const map = new Map<string, HomeworkItem[]>();
    for (const hw of homework) {
      const d = new Date(hw.deadlineAt);
      const key = `${hw.subjectId}:${dateKey(d)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(hw);
    }
    return map;
  }, [homework]);

  return (
    <div className="variant">
      <div className="mtx-wrapper">
        <table className="mtx-table">
          <thead>
            <tr>
              <th className="mtx-corner" />
              {days.map((d) => {
                const today = isToday(d);
                return (
                  <th key={dateKey(d)} className={`mtx-day-header ${today ? "mtx-day-header--today" : ""}`}>
                    <span className="mtx-day-header__name">{d.toLocaleDateString("ru-RU", { weekday: "short" })}</span>
                    <span className={`mtx-day-header__num ${today ? "mtx-day-header__num--today" : ""}`}>
                      {d.getDate()}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeSubjects.map((subj) => (
              <tr key={subj.id}>
                <td className="mtx-subject">
                  <span className="mtx-subject__dot" style={{ background: subj.color }} />
                  <span className="mtx-subject__name">{subj.name}</span>
                </td>
                {days.map((d) => {
                  const key = `${subj.id}:${dateKey(d)}`;
                  const items = matrix.get(key) ?? [];
                  const today = isToday(d);

                  return (
                    <td key={dateKey(d)} className={`mtx-cell ${today ? "mtx-cell--today-col" : ""}`}>
                      {items.map((hw) => (
                        <div
                          key={hw.id}
                          className={`mtx-pip ${statusIndicator(hw)}`}
                          title={hw.description}
                          onClick={() => onSelect?.(hw)}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mtx-legend">
        <span className="mtx-legend__item"><span className="mtx-pip mtx-cell--new" /> Новое</span>
        <span className="mtx-legend__item"><span className="mtx-pip mtx-cell--missed" /> Просрочено</span>
        <span className="mtx-legend__item"><span className="mtx-pip mtx-cell--review" /> Проверка</span>
        <span className="mtx-legend__item"><span className="mtx-pip mtx-cell--checked" /> Проверено</span>
        <span className="mtx-legend__item"><span className="mtx-pip mtx-cell--done" /> Сдано</span>
      </div>
    </div>
  );
}
