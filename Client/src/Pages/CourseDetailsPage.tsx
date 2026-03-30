import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import courseDetails from '../assets/image/courseDetails.svg';

import { Calendar } from '../Components/ui/Calendar/Calendar';
import PreviewEvent from '../Components/ui/Events/PreviewEvents/PreviewEvent';
import { LessonList } from '../Components/ui/lesson/LessonList';

import { NextLessonCard } from '../Components/ui/lesson/NextLessonCard';
import { TeachersCard } from '../Components/ui/Teacher/TeachersCard';
import { useLessonStore } from '../stores/scheduleStore';
import { useCourseStore } from '../stores/courseStore';
import { useLesson } from '../hooks/useLessons';
import { courseCardApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/pages/CourseDetailsPage.module.css';

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const parsedCourseId = courseId ? Number(courseId) : null;
  const resolvedCourseId = Number.isFinite(parsedCourseId)
    ? parsedCourseId
    : null;
  const { lessons, setLesson, setSelectedDate } = useLessonStore();
  const {
    course,
    fetchCourse,
    loading: courseLoading,
    error: courseError,
    clearCourse,
  } = useCourseStore();
  const {
    getCourseLessons,
    loading: lessonsLoading,
    error: lessonsError,
  } = useLesson();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sortedLessons = useMemo(
    () =>
      [...lessons].sort(
        (a, b) => new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime()
      ),
    [lessons]
  );

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

  if (!resolvedCourseId) {
    return <div>Некорректный идентификатор курса.</div>;
  }

  if (courseLoading || lessonsLoading) {
    return <div>Загрузка данных курса...</div>;
  }

  if (courseError) {
    return <div>Ошибка загрузки курса: {courseError}</div>;
  }

  if (lessonsError) {
    return <div>Ошибка загрузки уроков: {lessonsError}</div>;
  }

  return (
    <>
      <PreviewEvent
        imageUrl={course?.previewUrl || courseDetails}
        title={course?.name || 'Курс'}
        description={course?.description || ''}
        buttonText="Вступить"
        onButtonClick={handleJoin}
        imageAlt={course?.name || 'Курс'}
      />

      <div className={styles.courseActions}>
        <button
          type="button"
          onClick={handleCreateLesson}
          disabled={!resolvedCourseId}
          className={styles.actionButton}
        >
          Создать урок
        </button>
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
        {deleteError && (
          <div className={styles.actionError}>{deleteError}</div>
        )}
      </div>

      <div>
        <Calendar />
        <LessonList />
      </div>

      <div>
        <NextLessonCard />
        <TeachersCard />
      </div>
    </>
  );
};

export default CourseDetailsPage;
