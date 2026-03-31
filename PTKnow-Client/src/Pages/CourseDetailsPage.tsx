import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import courseDetails from '../assets/image/courseDetails.svg';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Calendar } from '../Components/ui/Calendar/Calendar';
import { LessonList } from '../Components/ui/lesson/LessonList';

import { NextLessonCard } from '../Components/ui/lesson/NextLessonCard';
import { TeachersCard } from '../Components/ui/Teacher/TeachersCard';
import { useLessonStore } from '../stores/scheduleStore';
import { useCourseStore } from '../stores/courseStore';
import { useLesson } from '../hooks/useLessons';
import { courseCardApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import type { CourseTeacherDTO } from '../types/CourseCard';
import styles from '../styles/pages/CourseDetailsPage.module.css';

const formatLessonTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const parsedCourseId = courseId ? Number(courseId) : null;
  const resolvedCourseId = Number.isFinite(parsedCourseId)
    ? parsedCourseId
    : null;
  const { setLesson, setSelectedDate } = useLessonStore();
  const {
    course,
    fetchCourse,
    loading: courseLoading,
    error: courseError,
    clearCourse,
    forbidden: courseForbidden,
  } = useCourseStore();
  const {
    getCourseLessons,
    loading: lessonsLoading,
    error: lessonsError,
    lessons: fetchedLessons,
  } = useLesson();
  const { user } = useAuth();
  const { enrolledCourses } = useMyEnrollments();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const normalizedLessons = useMemo(
    () => (Array.isArray(fetchedLessons) ? fetchedLessons : []),
    [fetchedLessons]
  );

  const sortedLessons = useMemo(
    () =>
      [...normalizedLessons].sort(
        (a, b) => new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime()
      ),
    [normalizedLessons]
  );

  const nextLesson = useMemo(() => {
    if (sortedLessons.length === 0) return null;
    const now = new Date();
    const upcoming = sortedLessons.find(
      lesson => new Date(lesson.beginAt).getTime() > now.getTime()
    );
    return upcoming ?? sortedLessons[0];
  }, [sortedLessons]);

  useEffect(() => {
    if (!resolvedCourseId) {
      return;
    }

    fetchCourse(resolvedCourseId);
    getCourseLessons(resolvedCourseId).catch(error => {
      console.error('Ошибка загрузки уроков:', error);
    });
  }, [fetchCourse, getCourseLessons, resolvedCourseId]);

  useEffect(() => {
    if (sortedLessons.length === 0) {
      setLesson([]);
      return;
    }

    const firstLessonDate = new Date(sortedLessons[0].beginAt)
      .toISOString()
      .split('T')[0];
    setLesson(sortedLessons);
    setSelectedDate(firstLessonDate);
  }, [sortedLessons, setLesson, setSelectedDate]);

  const handleJoin = useCallback(() => {
    if (resolvedCourseId) {
      navigate(`/course/${resolvedCourseId}/register`);
    }
  }, [navigate, resolvedCourseId]);

  const handleCreateLesson = useCallback(() => {
    if (resolvedCourseId) {
      navigate(`/courses/${resolvedCourseId}/lessons/new`);
    }
  }, [navigate, resolvedCourseId]);

  const canDeleteCourse = useMemo(() => {
    if (!course || !user) return false;
    const normalizedRole = user.role?.toUpperCase() ?? '';
    return normalizedRole === 'ADMIN' || user.id === course.owner?.id;
  }, [course, user]);

  const canManageLessons = useMemo(() => {
    if (!course || !user) return false;
    const normalizedRole = user.role?.toUpperCase() ?? '';
    return normalizedRole === 'ADMIN' || user.id === course.owner?.id;
  }, [course, user]);

  const teachers = useMemo(() => {
    if (!course) return [];
    const result: CourseTeacherDTO[] = [];
    if (course.owner) {
      result.push(course.owner);
    }
    if (course.editors?.length) {
      course.editors.forEach(editor => {
        if (!result.some(teacher => teacher.id === editor.id)) {
          result.push(editor);
        }
      });
    }
    return result;
  }, [course]);

  const isEnrolled = useMemo(() => {
    if (!resolvedCourseId) return false;
    return enrolledCourses.some(courseItem => courseItem.id === resolvedCourseId);
  }, [enrolledCourses, resolvedCourseId]);

  const handleDeleteCourse = useCallback(async () => {
    if (!resolvedCourseId || isDeleting) {
      return;
    }

    const confirmed = window.confirm('Удалить курс без возможности восстановления?');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await courseCardApi.delete(resolvedCourseId);
      clearCourse();
      navigate('/courses');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось удалить курс.';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [clearCourse, isDeleting, navigate, resolvedCourseId]);

  const handleLeaveCourse = useCallback(async () => {
    if (!resolvedCourseId || !isEnrolled) {
      return;
    }
    const confirmed = window.confirm('Покинуть курс?');
    if (!confirmed) {
      return;
    }
    try {
      await courseCardApi.cancelEnrollment(resolvedCourseId);
      navigate('/courses');
    } catch (error) {
      console.error('Не удалось покинуть курс:', error);
    }
  }, [isEnrolled, navigate, resolvedCourseId]);

  if (!resolvedCourseId) {
    return (
      <>
        <Header />
        <div className={styles.page}>Некорректный идентификатор курса.</div>
        <Footer />
      </>
    );
  }

  if (courseLoading || lessonsLoading) {
    return (
      <>
        <Header />
        <div className={styles.page}>Загрузка данных курса...</div>
        <Footer />
      </>
    );
  }

  if (courseForbidden) {
    const blockedTitle = 'Доступ ограничен';
    const blockedText = user
      ? 'Этот курс доступен только участникам. Запишитесь, чтобы открыть материалы.'
      : 'Этот курс доступен только авторизованным участникам.';
    const blockedButtonLabel = user ? 'Записаться' : 'Войти';
    const handleBlockedAction = () => {
      if (user) {
        handleJoin();
        return;
      }
      navigate('/auth');
    };
    return (
      <>
        <Header />
        <div className={styles.courseBlocked}>
          <div className={styles.courseBlockedCard}>
            <p className={styles.courseBlockedTitle}>{blockedTitle}</p>
            <p className={styles.courseBlockedText}>{blockedText}</p>
            <button
              type="button"
              className={styles.courseBlockedButton}
              onClick={handleBlockedAction}
            >
              {blockedButtonLabel}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (courseError) {
    return (
      <>
        <Header />
        <div className={styles.page}>Ошибка загрузки курса: {courseError}</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.page}>
        <section className={styles.heroSection}>
        <div className={styles.heroCard}>
          <div className={styles.heroMedia}>
            <img
              src={course?.previewUrl || courseDetails}
              alt={course?.name || 'Курс'}
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroContent}>
            <div className={styles.heroTitleRow}>
              <h1>{course?.name || 'Курс'}</h1>
              {course?.handle && (
                <span className={styles.heroHandle}>@{course.handle}</span>
              )}
            </div>
            <p className={styles.heroDescription}>
              {course?.description || 'Описание курса появится позже.'}
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.heroBadge}>
                {course?.state ?? '—'}
              </span>
              <div className={styles.heroTags}>
                {course?.tags?.length
                  ? course.tags.map(tag => (
                      <span key={tag} className={styles.heroTag}>
                        {tag}
                      </span>
                    ))
                  : (
                      <span className={styles.heroTagEmpty}>
                        Теги не указаны
                      </span>
                    )}
              </div>
            </div>
          </div>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={isEnrolled ? handleLeaveCourse : handleJoin}
            >
              {isEnrolled ? 'Покинуть' : 'Вступить'}
            </button>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>Показатели курса</div>
          <div className={styles.summaryPanel}>
            <div className={styles.summaryItem}>
              <span>Уроков</span>
              <strong>{course?.lessonsCount ?? '—'}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Студентов</span>
              <strong>{course?.studentsCount ?? '—'}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Преподавателей</span>
              <strong>{course?.teachersCount ?? '—'}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Максимум</span>
              <strong>{course?.maxUsersAmount ?? '—'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <div className={styles.blockCard}>
            <div className={styles.blockHeader}>Расписание и уроки</div>
            {lessonsError && (
              <div className={styles.lessonsWarning}>{lessonsError}</div>
            )}
            <Calendar />
            <LessonList canManageLessons={canManageLessons} />
          </div>

          <div className={styles.blockCard}>
            <div className={styles.blockHeader}>Все уроки</div>
            {sortedLessons.length === 0 ? (
              <p className={styles.blockText}>
                Уроки пока не запланированы.
              </p>
            ) : (
              <div className={styles.lessonTable}>
                {sortedLessons.map(lesson => (
                  <div key={lesson.id} className={styles.lessonRow}>
                    <div className={styles.lessonInfo}>
                      <p className={styles.lessonName}>{lesson.name}</p>
                      <p className={styles.lessonMeta}>
                        {lesson.description || 'Описание будет добавлено позже.'}
                      </p>
                    </div>
                    <div className={styles.lessonTime}>
                      {formatLessonTime(lesson.beginAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.blockCard}>
            <div className={styles.blockHeader}>Описание курса</div>
            <p className={styles.blockText}>
              {course?.description || 'Описание курса появится позже.'}
            </p>
          </div>

          <div className={styles.blockCard}>
            <div className={styles.blockHeader}>Детали курса</div>
            <div className={styles.detailsGrid}>
              <div>
                <p>Теги</p>
                <span>
                  {course?.tags?.length ? course.tags.join(', ') : '—'}
                </span>
              </div>
              <div>
                <p>Статус</p>
                <span>{course?.state ?? '—'}</span>
              </div>
              <div>
                <p>Максимум участников</p>
                <span>{course?.maxUsersAmount ?? '—'}</span>
              </div>
              <div>
                <p>Уроков</p>
                <span>{course?.lessonsCount ?? '—'}</span>
              </div>
              <div>
                <p>Студентов</p>
                <span>{course?.studentsCount ?? '—'}</span>
              </div>
              <div>
                <p>Преподавателей</p>
                <span>{course?.teachersCount ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className={styles.sideColumn}>
          <NextLessonCard
            lesson={nextLesson}
            studentsCount={course?.studentsCount}
          />
          <TeachersCard teachers={teachers} />
          {(canManageLessons || canDeleteCourse) && (
            <div className={styles.sideCard}>
              <div className={styles.sideHeader}>Управление</div>
              <div className={styles.sideActions}>
                {canManageLessons && (
                  <button
                    type="button"
                    onClick={handleCreateLesson}
                    disabled={!resolvedCourseId}
                    className={styles.actionButton}
                  >
                    Создать урок
                  </button>
                )}
                {canDeleteCourse && (
                  <button
                    type="button"
                    onClick={handleDeleteCourse}
                    disabled={!resolvedCourseId || isDeleting}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    {isDeleting ? 'Удаление...' : 'Удалить курс'}
                  </button>
                )}
              </div>
              {deleteError && (
                <div className={styles.actionError}>{deleteError}</div>
              )}
            </div>
          )}
        </aside>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetailsPage;
