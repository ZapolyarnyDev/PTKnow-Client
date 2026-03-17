import { useLessonStore } from '../../../stores/scheduleStore';
import styles from '../../../styles/components/Calendar.module.css';
import { formatDate, formatDay, formatMonth } from '../../../utils/dateUtils';

export const Calendar = () => {
  const { lessons, selectedDate, setSelectedDate } = useLessonStore();

  const uniqueDates = [
    ...new Set(
      lessons.map(l => new Date(l.beginAt).toISOString().split('T')[0])
    ),
  ];

  return (
    <div className={styles.calendar}>
      {uniqueDates.map(dateStr => {
        const date = new Date(dateStr);
        const active = selectedDate === dateStr;

        return (
          <div
            key={dateStr}
            className={`${styles.dayCard} ${active ? styles.active : ''}`}
            onClick={() => setSelectedDate(dateStr)}
          >
            <div className={styles.weekday}>{formatDay(date)}</div>
            <div className={styles.day}>{formatDate(date)}</div>
            <div className={styles.month}>{formatMonth(date)}</div>
          </div>
        );
      })}
    </div>
  );
};
