import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem, type SubjectInfo } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant: Subject-First ──
   Горизонтальные карточки предметов с числами активные / долги,
   ниже список заданий выбранного предмета.
*/

interface SubjectStats {
  subject: SubjectInfo;
  active: number;
  overdue: number;
  total: number;
}

function getSubjectStats(): SubjectStats[] {
  const map = new Map<number, { active: number; overdue: number; total: number }>();

  for (const hw of HOMEWORK_LIST) {
    if (!map.has(hw.subjectId)) {
      map.set(hw.subjectId, { active: 0, overdue: 0, total: 0 });
    }
    const s = map.get(hw.subjectId)!;
    s.total++;
    if (hw.status !== "done") {
      s.active++;
      if (hw.status === "missed" || hw.status === "resend") {
        s.overdue++;
      }
    }
  }

  return SUBJECTS
    .filter((subj) => map.has(subj.id))
    .map((subj) => ({ subject: subj, ...map.get(subj.id)! }))
    .sort((a, b) => b.overdue - a.overdue || b.active - a.active);
}

function getHomeworkForSubject(subjectId: number): HomeworkItem[] {
  return HOMEWORK_LIST
    .filter((hw) => hw.subjectId === subjectId)
    .sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
    });
}

export default function VariantSubjectFirst() {
  const stats = useMemo(getSubjectStats, []);
  const [selectedId, setSelectedId] = useState<number>(stats[0]?.subject.id ?? 1);

  const selectedSubject = stats.find((s) => s.subject.id === selectedId);
  const homework = useMemo(() => getHomeworkForSubject(selectedId), [selectedId]);

  return (
    <div className="variant">
      {/* Subject cards row */}
      <div className="sf-cards-row">
        {stats.map((s) => {
          const isActive = s.subject.id === selectedId;
          return (
            <button
              key={s.subject.id}
              className={`sf-card ${isActive ? "sf-card--active" : ""}`}
              style={isActive ? { borderColor: s.subject.color, background: `${s.subject.color}0D` } : {}}
              onClick={() => setSelectedId(s.subject.id)}
            >
              <div className="sf-card__name" style={isActive ? { color: s.subject.color } : {}}>
                {s.subject.name}
              </div>
              <div className="sf-card__nums">
                <span className="sf-card__active">{s.active}</span>
                {s.overdue > 0 && <span className="sf-card__overdue">{s.overdue}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected subject header */}
      {selectedSubject && (
        <div className="sf-subject-header">
          <div className="sf-subject-header__dot" style={{ background: selectedSubject.subject.color }} />
          <div className="sf-subject-header__name">{selectedSubject.subject.name}</div>
          <div className="sf-subject-header__summary">
            {selectedSubject.active} активных
            {selectedSubject.overdue > 0 && (
              <span className="sf-subject-header__overdue"> / {selectedSubject.overdue} долг</span>
            )}
          </div>
        </div>
      )}

      {/* Homework list — hideSubject т.к. предмет уже выбран */}
      <div className="hwc-list">
        {homework.map((hw) => (
          <HwCard key={hw.id} hw={hw} hideSubject />
        ))}
      </div>
    </div>
  );
}
