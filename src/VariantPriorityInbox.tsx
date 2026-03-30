import { useState, useMemo } from "react";
import { HOMEWORK_LIST, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant: Priority Inbox (с collapse) ──
   Секции по срочности + каждая секция сворачивается.
   "Позже" и "Сданные" свёрнуты по умолчанию.
*/

interface PriorityGroup {
  key: string;
  title: string;
  variant: "overdue" | "urgent" | "resend" | "checked" | "review" | "week" | "later" | "done";
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
  const resend: HomeworkItem[] = [];
  const checked: HomeworkItem[] = [];
  const inReview: HomeworkItem[] = [];
  const thisWeek: HomeworkItem[] = [];
  const later: HomeworkItem[] = [];
  const done: HomeworkItem[] = [];

  for (const hw of list) {
    if (hw.status === "done") { done.push(hw); continue; }
    if (hw.status === "resend") { resend.push(hw); continue; }
    if (hw.status === "checked") { checked.push(hw); continue; }
    if (hw.status === "in_review") { inReview.push(hw); continue; }

    const deadline = new Date(hw.deadlineAt);
    const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

    if (diff < 0) overdue.push(hw);
    else if (diff <= 1) todayTomorrow.push(hw);
    else if (diff <= 7) thisWeek.push(hw);
    else later.push(hw);
  }

  const groups: PriorityGroup[] = [];
  if (overdue.length) groups.push({ key: "overdue", title: "Просрочено", variant: "overdue", items: overdue });
  if (todayTomorrow.length) groups.push({ key: "urgent", title: "Сдать сегодня / завтра", variant: "urgent", items: todayTomorrow });
  if (resend.length) groups.push({ key: "resend", title: "Требует пересдачи", variant: "resend", items: resend });
  if (checked.length) groups.push({ key: "checked", title: "Проверено Нейрумом", variant: "checked", items: checked });
  if (inReview.length) groups.push({ key: "review", title: "На проверке", variant: "review", items: inReview });
  if (thisWeek.length) groups.push({ key: "week", title: "На этой неделе", variant: "week", items: thisWeek });
  if (later.length) groups.push({ key: "later", title: "Позже", variant: "later", items: later });
  if (done.length) groups.push({ key: "done", title: "Сданные", variant: "done", items: done });
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
        <div className="empty-state">Нет заданий по выбранному предмету</div>
      )}

      {groups.map((group) => {
        const isCollapsed = !!collapsed[group.key];
        const alertCount = group.items.filter(
          (h) => h.status === "missed" || h.status === "resend"
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
