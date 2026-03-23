import { useCallback, useEffect, useMemo } from 'react';
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
  } = useCourseStore();
  const {
    getCourseLessons,
    loading: lessonsLoading,
    error: lessonsError,
  } = useLesson();
  const navigate = useNavigate();

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

      <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={handleCreateLesson}
          disabled={!resolvedCourseId}
          style={{
            border: 'none',
            borderRadius: '999px',
            padding: '10px 20px',
            background: '#0a5be0',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Создать урок
        </button>
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
