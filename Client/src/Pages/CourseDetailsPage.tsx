import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import courseDetails from '../assets/image/courseDetails.svg';
import PreviewEvent from '../Components/ui/Events/PreviewEvents/PreviewEvent';
import { useCourseStore } from '../stores/courseStore';

const mockCourse = {
  id: '1',
  name: 'Роботехника для начинающих',
  description:
    'Практические занятия по созданию и программированию роботов. Изучение основ электроники, механики и программировани.',
  previewUrl: courseDetails,
  participantsCount: 247,
  tags: ['React', 'TypeScript', 'Frontend'],
  handle: 'react-typescript-frontend',
};

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { course, loading, error, fetchCourse } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && !course) {
      fetchCourse(id);
    }
  }, [id, fetchCourse, course]);

  const displayCourse = course || mockCourse;

  if (loading)
    return (
      <div>
        <div>Загрузка курса...</div>
      </div>
    );

  if (error && !course) return <div>Курс не найден</div>;

  return (
    <PreviewEvent
      imageUrl={displayCourse.previewUrl || mockCourse.previewUrl}
      title={displayCourse.name}
      description={displayCourse.description}
      participantsCount={displayCourse.participantsCount || 0}
      buttonText="Вступить"
      onButtonClick={() => navigate(`/course/${displayCourse.id}/register`)}
      imageAlt={displayCourse.name}
    />
  );
};

export default CourseDetailsPage;
