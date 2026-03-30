import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant: Progress Tracker ──
   Фокус на прогрессе: прогресс-бар "сколько сдано из всего",
   сводка по предметам с мини-прогрессами,
   ниже — только то, что требует внимания (не сдано).
*/

interface VariantProgressTrackerProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

interface SubjectProgress {
  subjectId: number;
  name: string;
  color: string;
  total: number;
  done: number;
  overdue: number;
}

export default function VariantProgressTracker({ selectedSubjectId = null, onSelect }: VariantProgressTrackerProps) {
  const homework = useMemo(() => {
    if (selectedSubjectId === null) return HOMEWORK_LIST;
    return HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  const totalCount = homework.length;
  const doneCount = homework.filter((h) => h.status === "done").length;
  const overdueCount = homework.filter((h) => h.status === "missed" || h.status === "resend").length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const subjectProgress = useMemo((): SubjectProgress[] => {
    const map = new Map<number, SubjectProgress>();
    for (const hw of homework) {
      if (!map.has(hw.subjectId)) {
        const s = SUBJECTS.find((s) => s.id === hw.subjectId);
        map.set(hw.subjectId, {
          subjectId: hw.subjectId,
          name: s?.name ?? hw.subject,
          color: s?.color ?? "#999",
          total: 0,
          done: 0,
          overdue: 0,
        });
      }
      const sp = map.get(hw.subjectId)!;
      sp.total++;
      if (hw.status === "done") sp.done++;
      if (hw.status === "missed" || hw.status === "resend") sp.overdue++;
    }
    return [...map.values()].sort((a, b) => (a.done / a.total) - (b.done / b.total));
  }, [homework]);

  const actionItems = useMemo(() => {
    return homework
      .filter((hw) => hw.status !== "done" && hw.status !== "in_review" && hw.status !== "checked")
      .sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime());
  }, [homework]);

  return (
    <div className="variant">
      {/* Overall progress */}
      <div className="prog-hero">
        <div className="prog-hero__ring-wrapper">
          <svg className="prog-hero__ring" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="var(--purple)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 213.6} 213.6`}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <span className="prog-hero__pct">{pct}%</span>
        </div>
        <div className="prog-hero__stats">
          <div className="prog-hero__stat">
            <span className="prog-hero__num prog-hero__num--done">{doneCount}</span>
            <span className="prog-hero__label">сдано</span>
          </div>
          <div className="prog-hero__stat">
            <span className="prog-hero__num prog-hero__num--active">{totalCount - doneCount}</span>
            <span className="prog-hero__label">активных</span>
          </div>
          {overdueCount > 0 && (
            <div className="prog-hero__stat">
              <span className="prog-hero__num prog-hero__num--overdue">{overdueCount}</span>
              <span className="prog-hero__label">долги</span>
            </div>
          )}
        </div>
      </div>

      {/* Per-subject progress bars */}
      <div className="prog-subjects">
        <div className="prog-subjects__title">По предметам</div>
        {subjectProgress.map((sp) => {
          const spPct = sp.total > 0 ? Math.round((sp.done / sp.total) * 100) : 0;
          return (
            <div key={sp.subjectId} className="prog-bar-row">
              <div className="prog-bar-row__info">
                <span className="prog-bar-row__dot" style={{ background: sp.color }} />
                <span className="prog-bar-row__name">{sp.name}</span>
                <span className="prog-bar-row__frac">{sp.done}/{sp.total}</span>
                {sp.overdue > 0 && <span className="prog-bar-row__alert">{sp.overdue} долг</span>}
              </div>
              <div className="prog-bar">
                <div className="prog-bar__fill" style={{ width: `${spPct}%`, background: sp.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action needed */}
      {actionItems.length > 0 && (
        <div className="prog-action">
          <div className="prog-action__title">Требуют внимания ({actionItems.length})</div>
          <div className="prog-action__list">
            {actionItems.map((hw) => (
              <HwCard key={hw.id} hw={hw} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
