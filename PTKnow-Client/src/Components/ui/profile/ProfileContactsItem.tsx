import { memo } from 'react';
import StatusSt from '../../../assets/icons/status_student.svg';
import styles from '../../../styles/pages/ProfilePage.module.css';
import type { ProfileResponseDTO } from '../../../types/profile';
import type { User } from '../../../types/user';

interface ProfileContacts {
  profile: ProfileResponseDTO;
}

const ProfileContactsItemComponent = ({ profile }: ProfileContacts) => {
  const storedUser = localStorage.getItem('userData');
  const storedEmail = storedUser
    ? (JSON.parse(storedUser) as User | null)?.email
    : null;
  const email = profile.email || storedEmail || '—';
  return (
    <div className={styles.profileInfo}>
      <p className={styles.profileInfoTitle}>Контактная информация</p>
      <hr />

      <div className={styles.profileContacts}>
        <div className={styles.profileEmail}>
          <div className={styles.profileContactsIcon}>
            <img src={StatusSt} alt="" />
          </div>
          <div className={styles.emailTextWrapper}>
            <p>Email</p>
            <p>{email}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export const ProfileContactsItem = memo(ProfileContactsItemComponent);
