import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

interface VariantQuickWinsProps {
  selectedSubjectId?: number | null;
}

interface QuickTask extends HomeworkItem {
  effortMinutes: number;
  dayDiff: number;
}

function getSubjectColor(subjectId: number): string {
  return SUBJECTS.find((subject) => subject.id === subjectId)?.color ?? "#999999";
}

function getDayDiff(dateStr: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadline = new Date(dateStr);
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

  return Math.floor((target.getTime() - today.getTime()) / 86400000);
}

function formatDueLabel(dayDiff: number): string {
  if (dayDiff < 0) return `Просрочено на ${Math.abs(dayDiff)} дн.`;
  if (dayDiff === 0) return "Сдать сегодня";
  if (dayDiff === 1) return "Сдать завтра";
  return `Сдать через ${dayDiff} дн.`;
}

function estimateEffortMinutes(hw: HomeworkItem): number {
  const text = hw.description.toLowerCase();
  let estimate = 10;

  if (hw.description.length > 85) estimate += 5;
  if (hw.description.length > 130) estimate += 5;

  if (/(сочин|доклад|essay|контрольн|лаборатор|гербар|анализ)/i.test(text)) {
    estimate += 15;
  }

  if (/(прочитать|выучить|подготовить)/i.test(text)) {
    estimate += 5;
  }

  if (hw.status === "missed" || hw.status === "resend") {
    estimate += 5;
  }

  if (hw.hasFiles) {
    estimate += 5;
  }

  return estimate;
}

function toQuickTask(hw: HomeworkItem): QuickTask {
  return {
    ...hw,
    effortMinutes: estimateEffortMinutes(hw),
    dayDiff: getDayDiff(hw.deadlineAt),
  };
}

function compareQuickTasks(a: QuickTask, b: QuickTask): number {
  const statusPriority = (status: HomeworkItem["status"]): number => {
    if (status === "missed") return 0;
    if (status === "resend") return 1;
    return 2;
  };

  return (
    statusPriority(a.status) - statusPriority(b.status) ||
    a.dayDiff - b.dayDiff ||
    a.effortMinutes - b.effortMinutes
  );
}

function QuickTaskCard({ task }: { task: QuickTask }) {
  return (
    <article
      className={`qw-card ${
        task.dayDiff < 0 ? "qw-card--overdue" : task.dayDiff === 0 ? "qw-card--today" : ""
      }`}
    >
      <div className="qw-card__top">
        <div className="qw-card__subject-wrap">
          <span
            className="qw-card__subject-dot"
            style={{ background: getSubjectColor(task.subjectId) }}
          />
          <span className="qw-card__subject">{task.subject}</span>
        </div>
        <span className={`qw-card__effort ${task.effortMinutes <= 10 ? "qw-card__effort--fast" : ""}`}>
          ~{task.effortMinutes} мин
        </span>
      </div>

      <p className="qw-card__desc">{task.description}</p>

      <div className="qw-card__meta">
        <span className="qw-card__deadline">{formatDueLabel(task.dayDiff)}</span>
        {task.status === "resend" && <span className="qw-card__badge">Пересдача</span>}
        {task.status === "missed" && (
          <span className="qw-card__badge qw-card__badge--danger">Долг</span>
        )}
      </div>

      <button className="qw-card__action" type="button">
        Сделать сейчас
      </button>
    </article>
  );
}

export default function VariantQuickWins({
  selectedSubjectId = null,
}: VariantQuickWinsProps) {
  const visibleHomework = useMemo(
    () =>
      selectedSubjectId === null
        ? HOMEWORK_LIST
        : HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId),
    [selectedSubjectId],
  );

  const actionableTasks = useMemo(
    () => visibleHomework.filter((hw) => hw.status === "new" || hw.status === "missed" || hw.status === "resend"),
    [visibleHomework],
  );

  const rankedTasks = useMemo(
    () => actionableTasks.map(toQuickTask).sort(compareQuickTasks),
    [actionableTasks],
  );

  const quickTasks = useMemo(
    () => rankedTasks.filter((task) => task.effortMinutes <= 20),
    [rankedTasks],
  );

  const focusTasks = quickTasks.slice(0, 3);
  const laterTasks = quickTasks.slice(3);
  const heavyTasks = rankedTasks.filter((task) => task.effortMinutes > 20).slice(0, 3);

  const totalQuickMinutes = quickTasks.reduce((sum, task) => sum + task.effortMinutes, 0);
  const urgentQuickCount = quickTasks.filter((task) => task.dayDiff <= 0).length;
  const weekQuickCount = quickTasks.filter((task) => task.dayDiff <= 7).length;

  return (
    <div className="variant quickwins">
      <section className="qw-summary">
        <div className="qw-summary__item">
          <div className="qw-summary__value">{quickTasks.length}</div>
          <div className="qw-summary__label">быстрых задач</div>
        </div>
        <div className="qw-summary__item">
          <div className="qw-summary__value">{urgentQuickCount}</div>
          <div className="qw-summary__label">срочно сегодня</div>
        </div>
        <div className="qw-summary__item">
          <div className="qw-summary__value">{weekQuickCount}</div>
          <div className="qw-summary__label">на неделю</div>
        </div>
        <div className="qw-summary__item">
          <div className="qw-summary__value">~{totalQuickMinutes}м</div>
          <div className="qw-summary__label">общее время</div>
        </div>
      </section>

      {focusTasks.length > 0 ? (
        <section className="qw-section">
          <div className="qw-section__header">
            <h2 className="qw-section__title">Quick wins: начать сейчас</h2>
            <span className="qw-section__count">{focusTasks.length}</span>
          </div>
          <div className="qw-section__list">
            {focusTasks.map((task) => (
              <QuickTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-state">Быстрых задач сейчас нет — остаются только более объемные</div>
      )}

      {laterTasks.length > 0 && (
        <section className="qw-section">
          <div className="qw-section__header">
            <h2 className="qw-section__title">Можно закрыть позже</h2>
            <span className="qw-section__count">{laterTasks.length}</span>
          </div>
          <div className="qw-section__list">
            {laterTasks.map((task) => (
              <QuickTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {quickTasks.length === 0 && heavyTasks.length > 0 && (
        <section className="qw-section">
          <div className="qw-section__header">
            <h2 className="qw-section__title">Ближайшие большие задачи</h2>
            <span className="qw-section__count">{heavyTasks.length}</span>
          </div>
          <div className="hwc-list">
            {heavyTasks.map((task) => (
              <HwCard key={task.id} hw={task} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
