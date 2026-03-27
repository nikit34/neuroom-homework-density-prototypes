import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant 1+3: Subject Filter Chips + Collapse by Deadline ── */

interface VariantChipsCollapseProps {
  selectedSubjectId?: number | null;
}

function formatDeadlineGroup(dateStr: string): { key: string; label: string; priority: number } {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return { key: "overdue", label: "Просрочено", priority: 0 };
  if (diff === 0) return { key: "today", label: "Сегодня", priority: 1 };
  if (diff === 1) return { key: "tomorrow", label: "Завтра", priority: 2 };
  if (diff <= 7) return { key: "this-week", label: "На этой неделе", priority: 3 };
  return { key: "later", label: "Позже", priority: 4 };
}

export default function VariantChipsCollapse({
  selectedSubjectId = null,
}: VariantChipsCollapseProps) {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ later: true });
  const effectiveSelectedSubject = selectedSubjectId ?? selectedSubject;

  const activeHomework = useMemo(() => {
    let list = HOMEWORK_LIST.filter((h) => h.status !== "done");
    if (effectiveSelectedSubject !== null) {
      list = list.filter((h) => h.subjectId === effectiveSelectedSubject);
    }
    return list;
  }, [effectiveSelectedSubject]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; priority: number; items: HomeworkItem[] }>();
    for (const hw of activeHomework) {
      const g = formatDeadlineGroup(hw.deadlineAt);
      if (!map.has(g.key)) map.set(g.key, { label: g.label, priority: g.priority, items: [] });
      map.get(g.key)!.items.push(hw);
    }
    return [...map.entries()].sort((a, b) => a[1].priority - b[1].priority);
  }, [activeHomework]);

  const activeSubjects = useMemo(() => {
    const ids = new Set(HOMEWORK_LIST.filter((h) => h.status !== "done").map((h) => h.subjectId));
    return SUBJECTS.filter((s) => ids.has(s.id));
  }, []);

  const toggleCollapse = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="variant">
      {selectedSubjectId === null && (
        <div className="chips-row">
          <button
            className={`chip ${selectedSubject === null ? "chip--active" : ""}`}
            onClick={() => setSelectedSubject(null)}
            type="button"
          >
            Все предметы
          </button>
          {activeSubjects.map((s) => (
            <button
              key={s.id}
              className={`chip ${selectedSubject === s.id ? "chip--active" : ""}`}
              style={selectedSubject === s.id ? { background: s.color, borderColor: s.color } : {}}
              onClick={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
              type="button"
            >
              <span className="chip__dot" style={{ background: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 && <div className="empty-state">Нет заданий по выбранному предмету</div>}

      {groups.map(([key, group]) => {
        const isCollapsed = !!collapsed[key];
        const alertCount = group.items.filter((h) => h.status === "missed" || h.status === "resend").length;

        return (
          <div key={key} className={`collapse-group ${key === "overdue" ? "collapse-group--overdue" : ""}`}>
            <button className="collapse-header" onClick={() => toggleCollapse(key)}>
              <div className="collapse-header__left">
                <svg className={`collapse-chevron ${isCollapsed ? "" : "collapse-chevron--open"}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="collapse-header__title">{group.label}</span>
                <span className="collapse-header__count">{group.items.length}</span>
              </div>
              {alertCount > 0 && <span className="collapse-header__alert">{alertCount} !</span>}
            </button>
            {!isCollapsed && (
              <div className="collapse-body">
                {group.items.map((hw) => (
                  <HwCard key={hw.id} hw={hw} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <DoneSection selectedSubject={effectiveSelectedSubject} />
    </div>
  );
}

function DoneSection({ selectedSubject }: { selectedSubject: number | null }) {
  const [open, setOpen] = useState(false);
  const doneItems = useMemo(() => {
    let list = HOMEWORK_LIST.filter((h) => h.status === "done");
    if (selectedSubject !== null) list = list.filter((h) => h.subjectId === selectedSubject);
    return list;
  }, [selectedSubject]);

  if (doneItems.length === 0) return null;

  return (
    <div className="collapse-group collapse-group--done">
      <button className="collapse-header" onClick={() => setOpen(!open)}>
        <div className="collapse-header__left">
          <svg className={`collapse-chevron ${open ? "collapse-chevron--open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="collapse-header__title">Сданные</span>
          <span className="collapse-header__count">{doneItems.length}</span>
        </div>
      </button>
      {open && (
        <div className="collapse-body">
          {doneItems.map((hw) => (
            <HwCard key={hw.id} hw={hw} />
          ))}
        </div>
      )}
    </div>
  );
}
