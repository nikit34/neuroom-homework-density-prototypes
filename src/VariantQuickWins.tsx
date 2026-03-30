import { useMemo } from "react";
import { HOMEWORK_LIST, SUBJECTS, isOverdue, type HomeworkItem } from "./mockData";

/* ── Variant: Quick Wins ──
   Один плоский ранжированный список.
   Карточка: молнии сложности + предмет, описание, прогресс-бар времени.
   Алгоритм сортировки скрыт от ученика.
*/

interface VariantQuickWinsProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

interface RankedTask extends HomeworkItem {
  complexity: number;    // 1-5
  dayDiff: number;
  urgency: number;       // 0-1
  score: number;         // итоговый скор для сортировки
}

function subjectColor(subjectId: number): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color ?? "#999";
}

function getDayDiff(dateStr: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateStr);
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.floor((t.getTime() - today.getTime()) / 86400000);
}

function estimateComplexity(hw: HomeworkItem): number {
  const text = hw.description.toLowerCase();

  if (/(доклад|essay|write an essay|проект)/i.test(text)) return 5;
  if (/(сочинен|лаборатор|изложен)/i.test(text)) return 4;
  if (/(контрольн|подготовк|прочитать|выучить|конспект)/i.test(text)) return 3;
  if (/(таблиц|теорем|доказать|несколько)/i.test(text)) return 2;
  return 1;
}

function rankTasks(list: HomeworkItem[]): RankedTask[] {
  const tasks: RankedTask[] = list.map((hw) => {
    const dayDiff = getDayDiff(hw.deadlineAt);
    const complexity = estimateComplexity(hw);

    // urgency: 1.0 = просрочено/сегодня, 0.0 = далеко
    const urgency = dayDiff <= 0 ? 1.0 : Math.max(0, 1 - dayDiff / 14);

    // Итоговый score: выше = делать первым
    // Лёгкие + срочные наверху (quick wins), тяжёлые + далёкие внизу
    const score = urgency * 0.5 + (1 - (complexity - 1) / 4) * 0.3 + Math.random() * 0.01;

    return { ...hw, complexity, dayDiff, urgency, score };
  });

  // Чередование предметов: бонус если предмет отличается от предыдущего
  tasks.sort((a, b) => b.score - a.score);

  // Второй проход: мягкое чередование предметов
  const result: RankedTask[] = [];
  const remaining = [...tasks];
  let lastSubjectId = -1;

  while (remaining.length > 0) {
    // Ищем задачу с другим предметом среди топ-3
    let picked = -1;
    for (let i = 0; i < Math.min(3, remaining.length); i++) {
      if (remaining[i].subjectId !== lastSubjectId) {
        picked = i;
        break;
      }
    }
    if (picked === -1) picked = 0;

    const task = remaining.splice(picked, 1)[0];
    lastSubjectId = task.subjectId;
    result.push(task);
  }

  return result;
}

/** Прогресс-бар: сколько "запаса" осталось. 1.0 = полно времени, 0.0 = горит */
function timeProgress(dayDiff: number): { pct: number; color: string } {
  if (dayDiff <= 0) return { pct: 0, color: "#d45757" };
  if (dayDiff === 1) return { pct: 15, color: "#d45757" };
  if (dayDiff <= 3) return { pct: 35, color: "#e8a930" };
  if (dayDiff <= 7) return { pct: 65, color: "#f5c842" };
  return { pct: 90, color: "#07be7e" };
}

function Lightning({ count }: { count: number }) {
  return (
    <span className="qw2-lightning" aria-label={`Сложность: ${count} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`qw2-bolt ${i < count ? "qw2-bolt--on" : ""}`}>⚡</span>
      ))}
    </span>
  );
}

export default function VariantQuickWins({
  selectedSubjectId = null,
  onSelect,
}: VariantQuickWinsProps) {
  const tasks = useMemo(() => {
    let list = HOMEWORK_LIST.filter((hw) => hw.status === 10 || hw.status === 25);
    if (selectedSubjectId !== null) {
      list = list.filter((hw) => hw.subjectId === selectedSubjectId);
    }
    return rankTasks(list);
  }, [selectedSubjectId]);

  if (tasks.length === 0) {
    return (
      <div className="variant">
        <div className="empty-state">Все задания сданы или на проверке</div>
      </div>
    );
  }

  return (
    <div className="variant qw2">
      <div className="qw2-list">
        {tasks.map((task, index) => {
          const progress = timeProgress(task.dayDiff);
          const isFirst = index === 0;
          const color = subjectColor(task.subjectId);

          return (
            <div
              key={task.id}
              className={`qw2-card ${isFirst ? "qw2-card--first" : ""}`}
              onClick={() => onSelect?.(task)}
            >
              {/* Номер */}
              <div className={`qw2-card__num ${isFirst ? "qw2-card__num--first" : ""}`}>
                {index + 1}
              </div>

              <div className="qw2-card__body">
                {/* Строка 1: молнии + предмет */}
                <div className="qw2-card__top">
                  <Lightning count={task.complexity} />
                  <span className="qw2-card__subject" style={{ color }}>{task.subject}</span>
                </div>

                {/* Описание */}
                <p className="qw2-card__desc">{task.description}</p>

                {/* Прогресс-бар времени */}
                <div className="qw2-bar">
                  <div className="qw2-bar__track">
                    <div
                      className="qw2-bar__fill"
                      style={{ width: `${Math.max(progress.pct, 4)}%`, background: progress.color }}
                    />
                  </div>
                  <span className="qw2-bar__label" style={{ color: progress.color }}>
                    {task.dayDiff <= 0 ? "горит" : task.dayDiff === 1 ? "завтра" : `${task.dayDiff} дн.`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
