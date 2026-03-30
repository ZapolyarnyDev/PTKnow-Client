import { memo } from 'react';
import StatusSt from '../../../assets/icons/status_student.svg';
import DefaultAvatar from '../../../assets/icons/profile.svg';
import styles from '../../../styles/pages/ProfilePage.module.css';
import type { ProfileResponseDTO } from '../../../types/profile';
import { getAvatarUrl } from '../../../utils/fileUtils';

interface ProfileHeaderProps {
  profile: ProfileResponseDTO;
  isMyProfile: boolean;
  onEdit?: () => void;
  onLogout?: () => void;
}

const ProfileHeaderComponent = ({
  profile,
  isMyProfile,
  onEdit,
  onLogout,
}: ProfileHeaderProps) => {
  const avatarUrl = getAvatarUrl(profile) || DefaultAvatar;
  const courseLabel = profile.course ? `${profile.course} курс` : 'Курс —';
  const groupLabel = profile.numberGroup
    ? `Группа ${profile.numberGroup}`
    : 'Группа —';
  return (
    <div className={styles.profileHeader}>
      <img
        src={avatarUrl}
        alt={`Аватар ${profile.fullName}`}
        className={styles.profileAvatar}
      />
      <div className={styles.profileText}>
        <p className={styles.profileName}>{profile.fullName}</p>

        <div className={styles.profileStatus}>
          <img src={StatusSt} alt="Статус" />
          {profile.status}
        </div>

        {profile.role && (
          <div className={styles.profileRole}>{profile.role}</div>
        )}

        <div className={styles.profileCourseGroup}>
          <div className={styles.profileCourse}>{courseLabel}</div>
          <div className={styles.profileNumberGroup}>{groupLabel}</div>
        </div>
      </div>

      {isMyProfile && (
        <div className={styles.profileEdit}>
          <button onClick={onEdit}>Редактировать</button>
          <button onClick={onLogout} className={styles.profileLogout}>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export const ProfileHeader = memo(ProfileHeaderComponent);
