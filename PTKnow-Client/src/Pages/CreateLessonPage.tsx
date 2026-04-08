import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { FormAlert } from '../Components/ui/forms/FormAlert';
import { useAuth } from '../hooks/useAuth';
import { useLesson } from '../hooks/useLessons';
import { useCourseStore } from '../stores/courseStore';
import type { FileMetaDTO } from '../types/CourseCard';
import styles from '../styles/pages/CreateLessonPage.module.css';

const CreateLessonPage: React.FC = () => {
  const { courseId: courseIdParam, lessonId: lessonIdParam } = useParams<{
    courseId: string;
    lessonId?: string;
  }>();
  const parsedCourseId = courseIdParam ? Number(courseIdParam) : null;
  const parsedLessonId = lessonIdParam ? Number(lessonIdParam) : null;
  const courseId = Number.isFinite(parsedCourseId) ? parsedCourseId : null;
  const lessonId = Number.isFinite(parsedLessonId) ? parsedLessonId : null;
  const {
    lesson,
    createLesson,
    replaceLesson,
    getLessonById,
    addLessonMaterial,
    loading,
    error,
    clearError,
  } = useLesson();
  const { user, isLoading: authLoading, isInitialized } = useAuth();
  const {
    course,
    fetchCourse,
    loading: courseLoading,
    error: courseError,
  } = useCourseStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [beginAt, setBeginAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [type, setType] = useState('');
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [uploadedMaterials, setUploadedMaterials] = useState<FileMetaDTO[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId, true);
    }
  }, [courseId, fetchCourse]);

  useEffect(() => {
    if (lessonId) {
      getLessonById(lessonId).catch(errorValue => {
        console.error('Error fetching lesson:', errorValue);
      });
    }
  }, [getLessonById, lessonId]);

  useEffect(() => {
    if (!lessonId || !lesson) {
      return;
    }

    setName(lesson.name ?? '');
    setDescription(lesson.description ?? '');
    setContentMd(lesson.contentMd ?? '');
    setBeginAt(lesson.beginAt ? lesson.beginAt.slice(0, 16) : '');
    setEndsAt(lesson.endsAt ? lesson.endsAt.slice(0, 16) : '');
    setType(lesson.type ?? '');
  }, [lesson, lessonId]);

  const isEditMode = Boolean(lessonId);

  const canManageLessons = useMemo(() => {
    if (!user || !course) return false;
    const normalizedRole = user.role?.toUpperCase() ?? '';
    const isOwner = user.id === course.owner?.id;
    const isEditor = (course.editors ?? []).some(editor => editor.id === user.id);
    return normalizedRole === 'ADMIN' || normalizedRole === 'TEACHER' || isOwner || isEditor;
  }, [course, user]);

  const isFormDisabled =
    loading ||
    !courseId ||
    authLoading ||
    courseLoading ||
    !canManageLessons;

  if (!courseId) {
    return <Navigate to="/home" replace />;
  }

  if (
    isInitialized &&
    !authLoading &&
    !courseLoading &&
    user &&
    course &&
    !canManageLessons
  ) {
    return <Navigate to="/home" replace />;
  }

  const toIso = (value: string) => (value ? new Date(value).toISOString() : '');

  const resetErrors = () => {
    if (error) {
      clearError();
    }
    if (localError) {
      setLocalError(null);
    }
    if (uploadError) {
      setUploadError(null);
    }
    if (uploadMessage) {
      setUploadMessage(null);
    }
  };

  const handleMaterialFilesChange = (files: FileList | null) => {
    setUploadedMaterials([]);
    setUploadMessage(null);
    setUploadError(null);
    setMaterialFiles([]);

    if (!files || files.length === 0) {
      return;
    }

    setMaterialFiles(Array.from(files));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetErrors();

    if (!courseId) {
      setLocalError('Не найден идентификатор курса.');
      return;
    }

    if (!user || !isInitialized) {
      setLocalError('Сначала войдите, чтобы управлять уроками.');
      return;
    }

    if (!canManageLessons) {
      setLocalError('У вас нет прав для управления уроками этого курса.');
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !beginAt ||
      !endsAt ||
      !type.trim()
    ) {
      setLocalError('Заполните все обязательные поля.');
      return;
    }

    const beginIso = toIso(beginAt);
    const endIso = toIso(endsAt);

    if (beginIso && endIso && beginIso >= endIso) {
      setLocalError('Дата окончания должна быть позже даты начала.');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        contentMd: contentMd.trim(),
        beginAt: beginIso,
        endsAt: endIso,
        type: type.trim(),
        timeRangeValid: beginIso < endIso,
      };

      const savedLesson =
        isEditMode && lessonId
          ? await replaceLesson(lessonId, payload)
          : await createLesson(courseId, payload);

      if (materialFiles.length > 0) {
        try {
          const uploaded = await Promise.all(
            materialFiles.map(file => addLessonMaterial(savedLesson.id, file))
          );
          setUploadedMaterials(uploaded);
          setUploadMessage(
            uploaded.length === 1
              ? 'Материал успешно добавлен к уроку.'
              : `Материалы успешно добавлены: ${uploaded.length}`
          );
        } catch (materialError) {
          const message =
            materialError instanceof Error
              ? materialError.message
              : 'Не удалось загрузить материал.';
          setUploadError(message);
        }
      }

      navigate(`/courses/${courseId}/lessons/${savedLesson.id}`);
    } catch (submitError) {
      console.error('Error saving lesson:', submitError);
    }
  };

  const activeMessage =
    (localError || error || uploadError || uploadMessage) ?? null;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div className={styles.heroMain}>
              <div className={styles.heroBadges}>
                <span className={styles.badge}>Урок</span>
                <span className={styles.badgeSecondary}>
                  {isEditMode ? 'Редактирование' : 'Создание'}
                </span>
                {course?.handle && (
                  <span className={styles.badgeGhost}>@{course.handle}</span>
                )}
              </div>
              <h1 className={styles.title}>
                {isEditMode ? 'Настройте урок' : 'Создайте сильный урок'}
              </h1>
              <p className={styles.subtitle}>
                Соберите тему, расписание и материалы в одной форме, чтобы урок
                сразу выглядел цельным и готовым к публикации
              </p>
            </div>

            <aside className={styles.heroAside}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Курс</span>
                <strong>{course?.name ?? '—'}</strong>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Режим</span>
                <strong>{isEditMode ? 'Обновление урока' : 'Новый урок'}</strong>
              </div>
            </aside>
          </section>

          <div className={styles.noticeStack}>
            {courseError && (
              <div className={styles.notice}>Ошибка загрузки курса: {courseError}</div>
            )}
            {!authLoading && !user && (
              <div className={styles.notice}>
                Войдите в аккаунт автора курса, чтобы управлять уроками.
                <button
                  type="button"
                  className={styles.noticeAction}
                  onClick={() => navigate('/auth')}
                >
                  Войти
                </button>
              </div>
            )}
            {user && !canManageLessons && (
              <div className={styles.notice}>
                У вас нет прав для управления уроками в этом курсе.
              </div>
            )}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Основа урока</h2>
                  <p>Название, формат и короткое описание того, что получит студент</p>
                </div>
              </div>

              <div className={styles.gridTwo}>
                <label className={styles.field}>
                  <span>Название урока</span>
                  <input
                    type="text"
                    value={name}
                    onChange={event => {
                      resetErrors();
                      setName(event.target.value);
                    }}
                    placeholder="Например: Введение в типографику интерфейсов"
                    disabled={isFormDisabled}
                    required
                  />
                </label>

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
              </div>

              <label className={styles.field}>
                <span>Описание</span>
                <textarea
                  value={description}
                  onChange={event => {
                    resetErrors();
                    setDescription(event.target.value);
                  }}
                  placeholder="Кратко опишите цель урока, фокус и ожидаемый результат"
                  disabled={isFormDisabled}
                  required
                />
              </label>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Содержание</h2>
                  <p>Текст урока в Markdown и дополнительные материалы для скачивания</p>
                </div>
              </div>

              <label className={styles.field}>
                <span>Содержание урока (Markdown)</span>
                <textarea
                  value={contentMd}
                  onChange={event => {
                    resetErrors();
                    setContentMd(event.target.value);
                  }}
                  placeholder="# План урока&#10;&#10;Опишите ключевые тезисы, задания и ссылки"
                  disabled={isFormDisabled}
                  className={styles.markdownField}
                />
              </label>

              <div className={styles.uploadCard}>
                <div>
                  <h3>Материал урока</h3>
                  <p>Загрузите один или несколько файлов любого типа, которые должны сопровождать урок</p>
                </div>
                <label className={styles.uploadField}>
                  <input
                    type="file"
                    multiple
                    onChange={event => {
                      resetErrors();
                      handleMaterialFilesChange(event.target.files);
                    }}
                    disabled={isFormDisabled}
                  />
                  <span>
                    {materialFiles.length > 0
                      ? `Выбрано файлов: ${materialFiles.length}`
                      : 'Выбрать файлы'}
                  </span>
                </label>
                {materialFiles.length > 0 && (
                  <div className={styles.fileList}>
                    {materialFiles.map(file => (
                      <span key={`${file.name}-${file.size}`} className={styles.fileChip}>
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
                {uploadedMaterials.length > 0 && (
                  <div className={styles.fileList}>
                    {uploadedMaterials.map(file => (
                      <span key={file.id} className={styles.fileChip}>
                        {file.originalFilename}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Расписание</h2>
                  <p>Выберите время начала и окончания, чтобы урок попал в календарь</p>
                </div>
              </div>

              <div className={styles.gridTwo}>
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
            </section>

            {activeMessage && (
              <FormAlert
                message={activeMessage}
                variant={
                  uploadMessage && !(localError || error || uploadError)
                    ? 'success'
                    : 'error'
                }
              />
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(`/course/${courseId}`)}
              >
                Отмена
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isFormDisabled}>
                {loading
                  ? isEditMode
                    ? 'Сохранение...'
                    : 'Создание...'
                  : isEditMode
                    ? 'Сохранить урок'
                    : 'Создать урок'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateLessonPage;
