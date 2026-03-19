import { memo, useCallback, useMemo } from 'react';
import { useLessonStore } from '../../../stores/scheduleStore';
import styles from '../../../styles/components/Calendar.module.css';
import { formatDate, formatDay, formatMonth } from '../../../utils/dateUtils';

const CalendarComponent = () => {
  const { lessons, selectedDate, setSelectedDate } = useLessonStore();

  const uniqueDates = useMemo(
    () => [
      ...new Set(
        lessons.map(l => new Date(l.beginAt).toISOString().split('T')[0])
      ),
    ],
    [lessons]
  );

  const handleSelectDate = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr);
    },
    [setSelectedDate]
  );

  return (
    <div className={styles.calendar}>
      {uniqueDates.map(dateStr => {
        const date = new Date(dateStr);
        const active = selectedDate === dateStr;

        return (
          <div
            key={dateStr}
            className={`${styles.dayCard} ${active ? styles.active : ''}`}
            onClick={() => handleSelectDate(dateStr)}
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

export const Calendar = memo(CalendarComponent);
