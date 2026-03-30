import { useMemo, useRef } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";

/* ── Variant: Kanban ──
   Горизонтальные колонки по статусу: Новое → На проверке → Проверено → Пересдать → Сдано.
   Свайп по горизонтали. Каждая колонка — вертикальный список мини-карточек.
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

  const homework = useMemo(() => {
    if (selectedSubjectId === null) return HOMEWORK_LIST;
    return HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  const columns = useMemo(() => buildColumns(homework), [homework]);

  return (
    <div className="variant">
      <div className="kanban-scroll" ref={scrollRef}>
        {columns.map((col) => (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col__header">
              <span className="kanban-col__dot" style={{ background: col.accentColor }} />
              <span className="kanban-col__title">{col.title}</span>
              <span className="kanban-col__count">{col.items.length}</span>
            </div>
            <div className="kanban-col__list">
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
    </div>
  );
}
