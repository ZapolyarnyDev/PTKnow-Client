import { memo, useMemo } from 'react';
import type { LessonDTO } from '../../../types/lesson';
import styles from '../../../styles/components/NextLessonCard.module.css';

interface NextLessonCardProps {
  lesson: LessonDTO | null;
  studentsCount?: number | null;
}

const formatLessonRange = (lesson: LessonDTO | null): string => {
  if (!lesson?.beginAt) {
    return 'Дата и время будут объявлены позже';
  }

  const start = new Date(lesson.beginAt);
  if (Number.isNaN(start.getTime())) {
    return 'Дата и время будут объявлены позже';
  }

  const end = lesson.endsAt ? new Date(lesson.endsAt) : null;
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateLabel = dateFormatter.format(start);
  const formattedDate = `${dateLabel.charAt(0).toUpperCase()}${dateLabel.slice(1)}`;
  const startTime = timeFormatter.format(start);
  const endTime =
    end && !Number.isNaN(end.getTime()) ? timeFormatter.format(end) : null;

  return endTime ? `${formattedDate}, ${startTime}–${endTime}` : `${formattedDate}, ${startTime}`;
};

const NextLessonCardComponent: React.FC<NextLessonCardProps> = ({
  lesson,
  studentsCount,
}) => {
  const formattedRange = useMemo(() => formatLessonRange(lesson), [lesson]);
  const participantsLabel =
    typeof studentsCount === 'number' ? studentsCount : '—';

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Следующее занятие</div>
      <div className={styles.card}>
        {lesson ? (
          <>
            <h3 className={styles.title}>{lesson.name}</h3>
            <p className={styles.meta}>{formattedRange}</p>
            <p className={styles.desc}>
              {lesson.description || 'Описание будет добавлено позже.'}
            </p>
          </>
        ) : (
          <p className={styles.empty}>Пока нет запланированных занятий.</p>
        )}
        <div className={styles.bottom}>
          <button
            type="button"
            className={styles.remindButton}
            disabled={!lesson}
          >
            Добавить напоминание
          </button>
          <span className={styles.counter}>Записано: {participantsLabel}</span>
        </div>
      </div>
    </div>
  );
};

export const NextLessonCard = memo(NextLessonCardComponent);
