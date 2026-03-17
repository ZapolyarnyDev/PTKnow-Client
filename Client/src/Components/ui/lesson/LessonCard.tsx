import { useLessonStore } from '../../../stores/scheduleStore';
import styles from '../../../styles/components/LessonCard.module.css';
import type { LessonDTO } from '../../../types/lesson';
import { formatFullDate, formatTime } from '../../../utils/dateUtils';

interface Props {
  lesson: LessonDTO;
}

export const LessonCard = ({ lesson }: Props) => {
  const { selectedDate } = useLessonStore();

  const begin = new Date(lesson.beginAt);
  const end = new Date(lesson.endsAt);
  const date = new Date(selectedDate);

  return (
    <div className={styles.container}>
      <p className={styles.date}>{formatFullDate(date)}</p>

      <div className={styles.card}>
        <div className={styles.left}>
          <h3 className={styles.title}>{lesson.name}</h3>
          <p className={styles.description}>{lesson.description}</p>
        </div>

        <div className={styles.time}>
          {formatTime(begin)}-{formatTime(end)}
        </div>
      </div>
    </div>
  );
};
