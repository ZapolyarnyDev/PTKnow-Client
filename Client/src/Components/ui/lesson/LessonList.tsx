import { useLessonStore } from '../../../stores/scheduleStore';
import { LessonCard } from './LessonCard';

export const LessonList = () => {
  const { lessons, selectedDate } = useLessonStore();

  const filtered = lessons.filter(
    lesson =>
      new Date(lesson.beginAt).toISOString().split('T')[0] === selectedDate
  );

  return (
    <div className="lesson-list">
      {filtered.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
};
