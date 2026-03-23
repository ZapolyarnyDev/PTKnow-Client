import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseDetails from '../assets/image/courseDetails.svg';

import { Calendar } from '../Components/ui/Calendar/Calendar';
import PreviewEvent from '../Components/ui/Events/PreviewEvents/PreviewEvent';
import { LessonList } from '../Components/ui/lesson/LessonList';

import { NextLessonCard } from '../Components/ui/lesson/NextLessonCard';
import { TeachersCard } from '../Components/ui/Teacher/TeachersCard';
import { useLessonStore } from '../stores/scheduleStore';
import { useCourseStore } from '../stores/courseStore';

const CourseDetailsPage: React.FC = () => {
  const { lessons, setSelectedDate } = useLessonStore();
  const { course, fetchCourse } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse(1);
  }, [fetchCourse]);

  useEffect(() => {
    if (lessons.length > 0) {
      const firstLessonDate = new Date(lessons[0].beginAt)
        .toISOString()
        .split('T')[0];
      setSelectedDate(firstLessonDate);
    }
  }, [lessons, setSelectedDate]);

  const handleJoin = useCallback(() => {
    if (course) {
      navigate(`/course/${course.id}/register`);
    }
  }, [navigate, course]);

  const handleCreateLesson = useCallback(() => {
    if (course) {
      navigate(`/courses/${course.id}/lessons/new`);
    }
  }, [navigate, course]);

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
          disabled={!course}
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
