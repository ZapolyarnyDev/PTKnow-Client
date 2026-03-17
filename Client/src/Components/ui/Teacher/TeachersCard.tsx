import styles from '../../../styles/components/TeachersCard.module.css';

export const TeachersCard = () => {
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
