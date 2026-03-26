import { useState, useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant 1+3: Subject Filter Chips + Collapse by Deadline ── */

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

function statusLabel(status: HomeworkItem["status"]): { text: string; cls: string } | null {
  switch (status) {
    case "in_review": return { text: "На проверке", cls: "label--primary" };
    case "resend": return { text: "Пересдай", cls: "label--error" };
    case "done": return { text: "Сдано", cls: "label--success" };
    case "missed": return { text: "Не сдано", cls: "label--error" };
    default: return null;
  }
}

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

export default function VariantChipsCollapse() {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    "later": true,
  });

  // Active homework (not done)
  const activeHomework = useMemo(() => {
    let list = HOMEWORK_LIST.filter((h) => h.status !== "done");
    if (selectedSubject !== null) {
      list = list.filter((h) => h.subjectId === selectedSubject);
    }
    return list;
  }, [selectedSubject]);

  // Group by deadline period
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; priority: number; items: HomeworkItem[] }>();
    for (const hw of activeHomework) {
      const g = formatDeadlineGroup(hw.deadlineAt);
      if (!map.has(g.key)) {
        map.set(g.key, { label: g.label, priority: g.priority, items: [] });
      }
      map.get(g.key)!.items.push(hw);
    }
    return [...map.entries()].sort((a, b) => a[1].priority - b[1].priority);
  }, [activeHomework]);

  // Subjects that actually appear
  const activeSubjects = useMemo(() => {
    const ids = new Set(HOMEWORK_LIST.filter((h) => h.status !== "done").map((h) => h.subjectId));
    return SUBJECTS.filter((s) => ids.has(s.id));
  }, []);

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="variant">
      {/* Subject Chips */}
      <div className="chips-row">
        <button
          className={`chip ${selectedSubject === null ? "chip--active" : ""}`}
          onClick={() => setSelectedSubject(null)}
        >
          Все предметы
        </button>
        {activeSubjects.map((s) => (
          <button
            key={s.id}
            className={`chip ${selectedSubject === s.id ? "chip--active" : ""}`}
            style={selectedSubject === s.id ? { background: s.color, borderColor: s.color } : {}}
            onClick={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
          >
            <span className="chip__dot" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </div>

      {/* Collapsible deadline groups */}
      {groups.length === 0 && (
        <div className="empty-state">Нет заданий по выбранному предмету</div>
      )}

      {groups.map(([key, group]) => {
        const isCollapsed = !!collapsed[key];
        const overdueCount = group.items.filter((h) => h.status === "missed" || h.status === "resend").length;

        return (
          <div key={key} className={`collapse-group ${key === "overdue" ? "collapse-group--overdue" : ""}`}>
            <button className="collapse-header" onClick={() => toggleCollapse(key)}>
              <div className="collapse-header__left">
                <svg
                  className={`collapse-chevron ${isCollapsed ? "" : "collapse-chevron--open"}`}
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="collapse-header__title">{group.label}</span>
                <span className="collapse-header__count">{group.items.length}</span>
              </div>
              {overdueCount > 0 && (
                <span className="collapse-header__alert">{overdueCount} !</span>
              )}
            </button>

            {!isCollapsed && (
              <div className="collapse-body">
                {group.items.map((hw) => {
                  const label = statusLabel(hw.status);
                  return (
                    <div key={hw.id} className="hw-row">
                      <div className="hw-row__color" style={{ background: subjectColor(hw.subjectId) }} />
                      <div className="hw-row__body">
                        <div className="hw-row__top">
                          <span className="hw-row__subject">{hw.subject}</span>
                          {label && <span className={`hw-row__label ${label.cls}`}>{label.text}</span>}
                        </div>
                        <div className="hw-row__desc">{hw.description}</div>
                        <div className="hw-row__meta">
                          <span className="hw-row__teacher">{hw.teacher}</span>
                          <span className="hw-row__deadline">
                            {new Date(hw.deadlineAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <svg className="hw-row__arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 5L12.5 10L7.5 15" stroke="#272443" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Done section — always collapsed by default */}
      <DoneSection selectedSubject={selectedSubject} />
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
          <svg
            className={`collapse-chevron ${open ? "collapse-chevron--open" : ""}`}
            width="16" height="16" viewBox="0 0 16 16" fill="none"
          >
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="collapse-header__title">Сданные</span>
          <span className="collapse-header__count">{doneItems.length}</span>
        </div>
      </button>
      {open && (
        <div className="collapse-body">
          {doneItems.map((hw) => (
            <div key={hw.id} className="hw-row hw-row--done">
              <div className="hw-row__color" style={{ background: subjectColor(hw.subjectId), opacity: 0.4 }} />
              <div className="hw-row__body">
                <div className="hw-row__top">
                  <span className="hw-row__subject">{hw.subject}</span>
                  {hw.estimate && (
                    <span className="hw-row__estimate">{hw.estimate}</span>
                  )}
                </div>
                <div className="hw-row__desc">{hw.description}</div>
              </div>
              <svg className="hw-row__arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="#272443" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
