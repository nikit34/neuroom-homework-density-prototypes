import { useState, useMemo } from "react";
import { HOMEWORK_LIST, isOverdue, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant: Priority Inbox (с collapse) ──
   Статусы: 10=не сдано, 20=проверяет Нейрум, 25=пересдать, 30=на проверке, 40=проверено
   Просрочено = status 10 + deadline в прошлом
*/

interface PriorityGroup {
  key: string;
  title: string;
  variant: "overdue" | "urgent" | "resend" | "neuroom" | "review" | "week" | "later" | "done";
  items: HomeworkItem[];
}

interface VariantPriorityInboxProps {
  onSelect?: (hw: HomeworkItem) => void;
}

function classifyIntoGroups(list: HomeworkItem[]): PriorityGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const overdue: HomeworkItem[] = [];
  const todayTomorrow: HomeworkItem[] = [];
  const resend: HomeworkItem[] = [];     // 25
  const neuroom: HomeworkItem[] = [];    // 20
  const inReview: HomeworkItem[] = [];   // 30
  const thisWeek: HomeworkItem[] = [];
  const later: HomeworkItem[] = [];
  const done: HomeworkItem[] = [];       // 40

  for (const hw of list) {
    if (hw.status === 40) { done.push(hw); continue; }
    if (hw.status === 25) { resend.push(hw); continue; }
    if (hw.status === 20) { neuroom.push(hw); continue; }
    if (hw.status === 30) { inReview.push(hw); continue; }

    // status 10 — не сдано
    if (isOverdue(hw)) { overdue.push(hw); continue; }

    const deadline = new Date(hw.deadlineAt);
    const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

    if (diff <= 1) todayTomorrow.push(hw);
    else if (diff <= 7) thisWeek.push(hw);
    else later.push(hw);
  }

  const groups: PriorityGroup[] = [];
  if (overdue.length) groups.push({ key: "overdue", title: "Просрочено", variant: "overdue", items: overdue });
  if (todayTomorrow.length) groups.push({ key: "urgent", title: "Сдать сегодня / завтра", variant: "urgent", items: todayTomorrow });
  if (resend.length) groups.push({ key: "resend", title: "Пересдать", variant: "resend", items: resend });
  if (neuroom.length) groups.push({ key: "neuroom", title: "Проверяет Нейрум", variant: "neuroom", items: neuroom });
  if (inReview.length) groups.push({ key: "review", title: "На проверке у учителя", variant: "review", items: inReview });
  if (thisWeek.length) groups.push({ key: "week", title: "На этой неделе", variant: "week", items: thisWeek });
  if (later.length) groups.push({ key: "later", title: "Позже", variant: "later", items: later });
  if (done.length) groups.push({ key: "done", title: "Проверено", variant: "done", items: done });
  return groups;
}

const DEFAULT_COLLAPSED: Record<string, boolean> = { later: true, done: true };

export default function VariantPriorityInbox({
  onSelect,
}: VariantPriorityInboxProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(DEFAULT_COLLAPSED);
  const groups = useMemo(() => classifyIntoGroups(HOMEWORK_LIST), []);

  const toggleCollapse = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="variant">
      {groups.length === 0 && (
        <div className="empty-state">Нет заданий</div>
      )}

      {groups.map((group) => {
        const isCollapsed = !!collapsed[group.key];
        const alertCount = group.items.filter(
          (h) => isOverdue(h) || h.status === 25
        ).length;

        return (
          <div
            key={group.key}
            className={`collapse-group ${group.variant === "overdue" ? "collapse-group--overdue" : ""} ${group.variant === "done" ? "collapse-group--done" : ""}`}
          >
            <button
              className={`collapse-header collapse-header--${group.variant}`}
              onClick={() => toggleCollapse(group.key)}
              type="button"
            >
              <div className="collapse-header__left">
                <svg
                  className={`collapse-chevron ${isCollapsed ? "" : "collapse-chevron--open"}`}
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="collapse-header__title">{group.title}</span>
                <span className="collapse-header__count">{group.items.length}</span>
              </div>
              {alertCount > 0 && (
                <span className="collapse-header__alert">{alertCount} !</span>
              )}
            </button>
            {!isCollapsed && (
              <div className="collapse-body">
                {group.items.map((hw) => (
                  <HwCard key={hw.id} hw={hw} onSelect={onSelect} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
