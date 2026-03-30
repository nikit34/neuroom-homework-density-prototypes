import { useMemo } from "react";
import { HOMEWORK_LIST, type HomeworkItem } from "./mockData";
import HwCard from "./HwCard";

interface VariantFigmaMobileProps {
  selectedSubjectId?: number | null;
  onSelect?: (hw: HomeworkItem) => void;
}

function byDeadlineAscending(a: HomeworkItem, b: HomeworkItem): number {
  return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
}

function isActiveHomework(hw: HomeworkItem): boolean {
  return hw.status === "new" || hw.status === "missed" || hw.status === "resend";
}

export default function VariantFigmaMobile({
  selectedSubjectId = null,
  onSelect,
}: VariantFigmaMobileProps) {
  const filteredHomework = useMemo(() => {
    const visibleHomework =
      selectedSubjectId === null
        ? HOMEWORK_LIST
        : HOMEWORK_LIST.filter((hw) => hw.subjectId === selectedSubjectId);

    return [...visibleHomework].sort(byDeadlineAscending);
  }, [selectedSubjectId]);

  const activeHomework = useMemo(
    () => filteredHomework.filter((hw) => isActiveHomework(hw)),
    [filteredHomework],
  );

  const completedHomework = useMemo(
    () => filteredHomework.filter((hw) => !isActiveHomework(hw)),
    [filteredHomework],
  );

  return (
    <div className="variant variant--figma">
      <section className="figma-section">
        <div className="figma-section__header">
          <h2 className="figma-section__title">Активные ({activeHomework.length})</h2>
        </div>
        <div className="figma-section__list">
          {activeHomework.length > 0 ? (
            activeHomework.map((hw) => <HwCard key={hw.id} hw={hw} onSelect={onSelect} />)
          ) : (
            <div className="empty-state">Нет активных заданий по выбранному предмету</div>
          )}
        </div>
      </section>

      <section className="figma-section">
        <div className="figma-section__header">
          <h2 className="figma-section__title">Сданные ({completedHomework.length})</h2>
        </div>
        <div className="figma-section__list">
          {completedHomework.length > 0 ? (
            completedHomework.map((hw) => <HwCard key={hw.id} hw={hw} onSelect={onSelect} />)
          ) : (
            <div className="empty-state">Пока нет выполненных заданий</div>
          )}
        </div>
      </section>
    </div>
  );
}
