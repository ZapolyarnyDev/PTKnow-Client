import { memo } from 'react';
import styles from '../../../styles/components/NextLessonCard.module.css';

const NextLessonCardComponent = () => {
  return (
    <div className={styles.wrapper}>
      <h2>Следующее занятие</h2>

      <div className={styles.card}>
        <h3>Введение, безопасность</h3>

        <p className={styles.meta}>Среда, 1 октября, 17:00–20:00</p>

        <p className={styles.desc}>
          Знакомство с курсом, техника безопасности, основные компоненты
          роботов.
        </p>

        <div className={styles.bottom}>
          <button>Добавить напоминание</button>
          <span>Записано: 36</span>
        </div>
      </div>
    </div>
  );
};

export const NextLessonCard = memo(NextLessonCardComponent);
