import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useProfile } from '../hooks/useProfile';
import styles from '../styles/pages/ProfileEditPage.module.css';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    error,
    getMyProfile,
    updateProfile,
    updateAvatar,
    clearError,
  } = useProfile();
  const [formData, setFormData] = useState({
    fullName: '',
    handle: '',
    summary: '',
    numberPhone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile();
  }, [getMyProfile]);

  useEffect(() => {
    if (!profile) return;
    setFormData({
      fullName: profile.fullName ?? '',
      handle: profile.handle ?? '',
      summary: profile.summary ?? '',
      numberPhone: profile.numberPhone ?? '',
      email: profile.email ?? '',
    });
  }, [profile]);

  const handleChange = useCallback(
    (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const { name, value } = event.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      clearError();
      setIsSubmitting(true);
      try {
        await updateProfile({
          fullName: formData.fullName.trim(),
          handle: formData.handle.trim(),
          summary: formData.summary.trim(),
          numberPhone: formData.numberPhone.trim(),
        });
        navigate('/profile');
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearError, formData, navigate, updateProfile]
  );

  const handleAvatarChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setAvatarPreview(URL.createObjectURL(file));
      setIsAvatarUploading(true);
      clearError();
      try {
        await updateAvatar(file);
      } finally {
        setIsAvatarUploading(false);
      }
    },
    [clearError, updateAvatar]
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h1 className={styles.title}>Редактирование профиля</h1>
              <p className={styles.subtitle}>
                Обновите имя, ник и описание для вашего профиля.
              </p>
            </div>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate('/profile')}
            >
              Назад
            </button>
          </div>

          {loading && (
            <div className={styles.stateMessage}>Загрузка профиля...</div>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.avatarBlock}>
              <div className={styles.avatarPreviewWrapper}>
                <img
                  src={avatarPreview || profile?.avatarUrl}
                  alt="Аватар"
                  className={styles.avatarPreview}
                />
              </div>
              <label className={styles.avatarUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isAvatarUploading}
                />
                {isAvatarUploading ? 'Загрузка...' : 'Загрузить аватар'}
              </label>
            </div>

            <label className={styles.field}>
              <span>Полное имя</span>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иванов Иван"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Handle</span>
              <input
                name="handle"
                type="text"
                value={formData.handle}
                onChange={handleChange}
                placeholder="ivanov"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Телефон</span>
              <input
                name="numberPhone"
                type="tel"
                value={formData.numberPhone}
                onChange={handleChange}
                placeholder="+7 900 000-00-00"
              />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                disabled
              />
              <span className={styles.fieldHint}>
                Email указан при регистрации и не изменяется.
              </span>
            </label>

            <label className={`${styles.field} ${styles.summaryField}`}>
              <span>О себе</span>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Коротко о себе и своих интересах"
                rows={5}
              />
            </label>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate('/profile')}
              >
                Отменить
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfileEditPage;
