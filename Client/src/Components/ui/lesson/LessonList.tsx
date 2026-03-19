import { memo, useMemo } from 'react';
import { useLessonStore } from '../../../stores/scheduleStore';
import { LessonCard } from './LessonCard';

const LessonListComponent = () => {
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
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
};

export const LessonList = memo(LessonListComponent);
