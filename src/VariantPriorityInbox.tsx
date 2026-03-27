import { useMemo } from "react";
import { HOMEWORK_LIST, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

/* ── Variant: Priority Inbox ──
   Секции по срочности: Просрочено → Сдать сегодня/завтра → Пересдача → Проверено Нейрумом → На проверке → Эта неделя → Позже → Сданные
*/

interface PriorityGroup {
  key: string;
  title: string;
  variant: "overdue" | "urgent" | "resend" | "checked" | "review" | "week" | "later" | "done";
  items: HomeworkItem[];
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

export default function VariantPriorityInbox() {
  const groups = useMemo(() => classifyIntoGroups(HOMEWORK_LIST), []);

  return (
    <div className="variant">
      {groups.map((group) => (
        <div key={group.key} className="pi-section">
          <div className={`pi-section__header pi-section__header--${group.variant}`}>
            <span className="pi-section__title">{group.title}</span>
            <span className="pi-section__count">{group.items.length}</span>
          </div>
          <div className="pi-section__list">
            {group.items.map((hw) => (
              <HwCard key={hw.id} hw={hw} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
