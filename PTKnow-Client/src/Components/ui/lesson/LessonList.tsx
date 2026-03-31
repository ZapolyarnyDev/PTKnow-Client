import { memo, useMemo } from 'react';
import { useLessonStore } from '../../../stores/scheduleStore';
import { LessonCard } from './LessonCard';

interface LessonListProps {
  canManageLessons?: boolean;
}

const LessonListComponent: React.FC<LessonListProps> = ({
  canManageLessons = false,
}) => {
  const { lessons, selectedDate } = useLessonStore();

  const filtered = useMemo(
    () =>
      lessons.filter(
        lesson =>
          new Date(lesson.beginAt).toISOString().split('T')[0] === selectedDate
      ),
    [lessons, selectedDate]
  );

  return (
    <div className="lesson-list">
      {filtered.map(lesson => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          canManageLessons={canManageLessons}
        />
      ))}
    </div>
  );
};

export const LessonList = memo(LessonListComponent);
