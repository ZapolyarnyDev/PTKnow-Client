import { memo } from 'react';
import styles from '../../../styles/components/TeachersCard.module.css';

const TeachersCardComponent = () => {
  return (
    <div className={styles.card}>
      <h2>Преподаватели</h2>

      <div className={styles.teacher}>
        <div className={styles.avatar}></div>
        <span>Владислав Ильин</span>
      </div>
    </div>
  );
};

export const TeachersCard = memo(TeachersCardComponent);
