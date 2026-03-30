import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant: Kanban ──
   Mobile: snap-scroll, одна колонка на весь экран,
   плавное перелистывание, видно края соседних колонок,
   точки-индикаторы + заголовки соседних колонок.
*/

interface VariantKanbanProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function formatDeadlineShort(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return `${Math.abs(diff)}д назад`;
  if (diff === 0) return "сегодня";
  if (diff === 1) return "завтра";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface KanbanColumn {
  key: string;
  title: string;
  accentColor: string;
  items: HomeworkItem[];
}

function buildColumns(list: HomeworkItem[]): KanbanColumn[] {
  const buckets: Record<string, HomeworkItem[]> = {
    active: [], review: [], checked: [], resend: [], done: [],
  };

  for (const hw of list) {
    switch (hw.status) {
      case "new": case "missed": buckets.active.push(hw); break;
      case "in_review": buckets.review.push(hw); break;
      case "checked": buckets.checked.push(hw); break;
      case "resend": buckets.resend.push(hw); break;
      case "done": buckets.done.push(hw); break;
    }
  }

  return [
    { key: "active", title: "Активные", accentColor: "#7455ff", items: buckets.active },
    { key: "review", title: "На проверке", accentColor: "#f5a623", items: buckets.review },
    { key: "checked", title: "Проверено", accentColor: "#07be7e", items: buckets.checked },
    { key: "resend", title: "Пересдать", accentColor: "#d45757", items: buckets.resend },
    { key: "done", title: "Сдано", accentColor: "#07be7e", items: buckets.done },
  ].filter((col) => col.items.length > 0);
}

export default function VariantKanban({ selectedSubjectId = null, onSelect }: VariantKanbanProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const homework = useMemo(() => {
    if (selectedSubjectId === null) return HOMEWORK_LIST;
    return HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  const columns = useMemo(() => buildColumns(homework), [homework]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const colWidth = el.offsetWidth;
    const index = Math.round(scrollLeft / colWidth);
    setActiveIndex(Math.min(index, columns.length - 1));
  }, [columns.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
  };

  return (
    <div className="variant kanban-variant">
      {/* Neighbour hints */}
      <div className="kanban-nav">
        {columns.map((col, i) => (
          <button
            key={col.key}
            className={`kanban-nav__item ${i === activeIndex ? "kanban-nav__item--active" : ""}`}
            style={i === activeIndex ? { borderColor: col.accentColor, color: col.accentColor } : {}}
            onClick={() => scrollTo(i)}
            type="button"
          >
            <span className="kanban-nav__dot" style={{ background: col.accentColor }} />
            <span className="kanban-nav__label">{col.title}</span>
            <span className="kanban-nav__count">{col.items.length}</span>
          </button>
        ))}
      </div>

      {/* Snap-scroll columns */}
      <div className="kanban-snap" ref={scrollRef}>
        {columns.map((col) => (
          <div key={col.key} className="kanban-page">
            <div className="kanban-page__header">
              <span className="kanban-page__dot" style={{ background: col.accentColor }} />
              <span className="kanban-page__title">{col.title}</span>
              <span className="kanban-page__count">{col.items.length}</span>
            </div>
            <div className="kanban-page__list">
              {col.items.map((hw) => (
                <div key={hw.id} className="kanban-card" onClick={() => onSelect?.(hw)} style={{ cursor: "pointer" }}>
                  <div className="kanban-card__bar" style={{ background: subjectColor(hw.subjectId) }} />
                  <div className="kanban-card__body">
                    <span className="kanban-card__subject">{hw.subject}</span>
                    <span className="kanban-card__desc">{hw.description}</span>
                    <span className="kanban-card__deadline">до {formatDeadlineShort(hw.deadlineAt)}</span>
                    {hw.status === "done" && hw.estimate && (
                      <span className="kanban-card__grade">{hw.estimate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="kanban-dots">
        {columns.map((col, i) => (
          <button
            key={col.key}
            className={`kanban-dots__dot ${i === activeIndex ? "kanban-dots__dot--active" : ""}`}
            style={i === activeIndex ? { background: col.accentColor } : {}}
            onClick={() => scrollTo(i)}
            type="button"
            aria-label={col.title}
          />
        ))}
      </div>
    </div>
  );
}
