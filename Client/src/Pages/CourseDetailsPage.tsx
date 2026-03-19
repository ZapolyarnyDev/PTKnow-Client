import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseDetails from '../assets/image/courseDetails.svg';

import { Calendar } from '../Components/ui/Calendar/Calendar';
import PreviewEvent from '../Components/ui/Events/PreviewEvents/PreviewEvent';
import { LessonList } from '../Components/ui/lesson/LessonList';

import { NextLessonCard } from '../Components/ui/lesson/NextLessonCard';
import { TeachersCard } from '../Components/ui/Teacher/TeachersCard';
import { mockLessons } from '../data/mockLesson';
import { useLessonStore } from '../stores/scheduleStore';

const mockCourse = {
  id: '1',
  name: 'Роботехника для начинающих',
  description: 'Практические занятия по созданию и программированию роботов.',
  previewUrl: courseDetails,
  participantsCount: 247,
};

const CourseDetailsPage: React.FC = () => {
  const { setLesson, setSelectedDate } = useLessonStore();
  const navigate = useNavigate();

  useEffect(() => {
    setLesson(mockLessons);
    setSelectedDate('2025-10-01');
  }, [setLesson, setSelectedDate]);

  const handleJoin = useCallback(() => {
    navigate(`/course/${mockCourse.id}/register`);
  }, [navigate]);

  const handleCreateLesson = useCallback(() => {
    navigate(`/courses/${mockCourse.id}/lessons/new`);
  }, [navigate]);

  return (
    <>
      <PreviewEvent
        imageUrl={mockCourse.previewUrl}
        title={mockCourse.name}
        description={mockCourse.description}
        participantsCount={mockCourse.participantsCount}
        buttonText="Вступить"
        onButtonClick={handleJoin}
        imageAlt={mockCourse.name}
      />

      <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={handleCreateLesson}
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
