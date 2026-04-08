import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';

import { CourseList } from '../Components/CourseList';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { useAuth } from '../hooks/useAuth';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import styles from '../styles/pages/MyCoursesPage.module.css';

const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { enrolledCourses, loading, error } = useMyEnrollments();

  const enrolledCourseCards = useMemo(
    () =>
      enrolledCourses.map(course => ({
        id: course.id,
        name: course.name,
        previewUrl: course.previewUrl,
        tags: [],
        description: '',
      })),
    [enrolledCourses]
  );

  const enrolledCourseIds = useMemo(
    () => enrolledCourses.map(course => course.id),
    [enrolledCourses]
  );

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Мои курсы</h1>
          <p>Курсы, на которые вы уже записаны.</p>
        </div>

        {!loading && enrolledCourseCards.length === 0 && (
          <p className={styles.empty}>У вас пока нет записей на курсы.</p>
        )}

        <CourseList
          showLoadMore={false}
          courses={enrolledCourseCards}
          isLoading={loading}
          error={error}
          enrolledCourseIds={enrolledCourseIds}
        />
      </main>
      <Footer />
    </>
  );
};

export default MyCoursesPage;
