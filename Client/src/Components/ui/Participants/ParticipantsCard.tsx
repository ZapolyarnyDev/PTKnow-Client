import { memo } from 'react';
import styles from './ParticipantsCard.module.css';

const users = ['МИ', 'ИП', 'АС', 'ОК', 'ДВ', 'ЕН', 'АМ'];

const ParticipantsCardComponent = () => {
  return (
    <div className={styles.card}>
      <h2>Участники</h2>

      <div className={styles.avatars}>
        {users.map(u => (
          <div key={u} className={styles.avatar}>
            {u}
          </div>
        ))}
        <div className={styles.more}>+2</div>
      </div>

      <p>36 из 40 мест занято</p>

      <div className={styles.progress}>
        <div className={styles.bar}></div>
      </div>
    </div>
  );
};

export const ParticipantsCard = memo(ParticipantsCardComponent);
