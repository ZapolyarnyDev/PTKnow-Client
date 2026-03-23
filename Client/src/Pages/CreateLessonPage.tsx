import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { useLesson } from '../hooks/useLessons';
import styles from '../styles/pages/CreateLessonPage.module.css';

const CreateLessonPage: React.FC = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const parsedCourseId = courseIdParam ? Number(courseIdParam) : null;
  const courseId = Number.isFinite(parsedCourseId) ? parsedCourseId : null;
  const { createLesson, loading, error, clearError } = useLesson();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [beginAt, setBeginAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [type, setType] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isFormDisabled = loading || !courseId;

  const toIso = (value: string) => (value ? new Date(value).toISOString() : '');

  const resetErrors = () => {
    if (error) {
      clearError();
    }
    if (localError) {
      setLocalError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetErrors();

    if (!courseId) {
      setLocalError('Не найден идентификатор курса.');
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !beginAt ||
      !endsAt ||
      !type.trim()
    ) {
      setLocalError('Заполните все поля.');
      return;
    }

    const beginIso = toIso(beginAt);
    const endIso = toIso(endsAt);

    if (beginIso && endIso && beginIso >= endIso) {
      setLocalError('Дата окончания должна быть позже даты начала.');
      return;
    }

    try {
      await createLesson(courseId, {
        name: name.trim(),
        description: description.trim(),
        contentMd: contentMd.trim(),
        beginAt: beginIso,
        endsAt: endIso,
        type: type.trim(),
      });

      setName('');
      setDescription('');
      setContentMd('');
      setBeginAt('');
      setEndsAt('');
      setType('');
    } catch (submitError) {
      console.error('Ошибка создания урока:', submitError);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Создание урока</h1>
          {!courseId && (
            <p className={styles.notice}>
              Добавьте идентификатор курса в URL, чтобы продолжить.
            </p>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Название урока</span>
            <input
              type="text"
              value={name}
              onChange={event => {
                resetErrors();
                setName(event.target.value);
              }}
              placeholder="Введите название"
              disabled={isFormDisabled}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Описание</span>
            <textarea
              value={description}
              onChange={event => {
                resetErrors();
                setDescription(event.target.value);
              }}
              placeholder="Коротко опишите урок"
              disabled={isFormDisabled}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Содержание (Markdown)</span>
            <textarea
              value={contentMd}
              onChange={event => {
                resetErrors();
                setContentMd(event.target.value);
              }}
              placeholder="Добавьте материал урока"
              disabled={isFormDisabled}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Начало</span>
              <input
                type="datetime-local"
                value={beginAt}
                onChange={event => {
                  resetErrors();
                  setBeginAt(event.target.value);
                }}
                disabled={isFormDisabled}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Окончание</span>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={event => {
                  resetErrors();
                  setEndsAt(event.target.value);
                }}
                disabled={isFormDisabled}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Тип занятия</span>
            <input
              type="text"
              value={type}
              onChange={event => {
                resetErrors();
                setType(event.target.value);
              }}
              placeholder="Например: LECTURE"
              disabled={isFormDisabled}
              required
            />
          </label>

          {(localError || error) && (
            <div className={styles.error}>{localError || error}</div>
          )}

          <div className={styles.actions}>
            <button type="submit" disabled={isFormDisabled}>
              {loading ? 'Создание...' : 'Создать урок'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default CreateLessonPage;
