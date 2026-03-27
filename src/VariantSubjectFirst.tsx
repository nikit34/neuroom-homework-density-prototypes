import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem, type SubjectInfo } from "./mockData";

/* ── Variant: Subject-First ──
   Горизонтальные карточки предметов с числами активные / долги,
   ниже список заданий выбранного предмета.
*/

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return `просрочено`;
  if (diff === 0) return "сегодня";
  if (diff === 1) return "завтра";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function statusInfo(hw: HomeworkItem): { text: string; cls: string } | null {
  switch (hw.status) {
    case "in_review": return { text: "На проверке", cls: "sf-status--review" };
    case "resend": return { text: "Пересдай", cls: "sf-status--resend" };
    case "missed": return { text: "Просрочено", cls: "sf-status--missed" };
    case "done": return { text: `Оценка: ${hw.estimate ?? "—"}`, cls: "sf-status--done" };
    default: return null;
  }
}

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
    .map((subj) => ({
      subject: subj,
      ...map.get(subj.id)!,
    }))
    .sort((a, b) => b.overdue - a.overdue || b.active - a.active);
}

function getHomeworkForSubject(subjectId: number): HomeworkItem[] {
  return HOMEWORK_LIST
    .filter((hw) => hw.subjectId === subjectId)
    .sort((a, b) => {
      // done в конец
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      // по дедлайну
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

      {/* Homework list */}
      <div className="sf-list">
        {homework.map((hw) => {
          const isDone = hw.status === "done";
          const isOverdue = hw.status === "missed" || hw.status === "resend";
          const status = statusInfo(hw);
          const deadlineText = formatDeadline(hw.deadlineAt);

          return (
            <div key={hw.id} className={`sf-item ${isDone ? "sf-item--done" : ""} ${isOverdue ? "sf-item--overdue" : ""}`}>
              <div className="sf-item__body">
                <div className="sf-item__desc">{hw.description}</div>
                <div className="sf-item__meta">
                  <span className="sf-item__teacher">{hw.teacher}</span>
                  <span className="sf-item__created">
                    {new Date(hw.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
              <div className="sf-item__right">
                {status && <span className={`sf-item__status ${status.cls}`}>{status.text}</span>}
                {!isDone && (
                  <span className={`sf-item__deadline ${isOverdue ? "sf-item__deadline--overdue" : ""}`}>
                    {deadlineText}
                  </span>
                )}
                {isDone && hw.estimate && (
                  <span className="sf-item__estimate">{hw.estimate}</span>
                )}
                <svg className="sf-item__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
