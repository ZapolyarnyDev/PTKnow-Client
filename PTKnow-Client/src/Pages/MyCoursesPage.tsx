import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { CourseList } from '../Components/CourseList';
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

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Мои курсы</h1>
          <p>Курсы, на которые вы уже записаны.</p>
        </div>

        {!user && (
          <div className={styles.notice}>
            <p>Войдите в аккаунт, чтобы увидеть список ваших курсов.</p>
            <Link to="/auth" className={styles.noticeButton}>
              Войти
            </Link>
          </div>
        )}

        {user && !loading && enrolledCourseCards.length === 0 && (
          <p className={styles.empty}>У вас пока нет записей на курсы.</p>
        )}

        {user && (
          <CourseList
            showLoadMore={false}
            courses={enrolledCourseCards}
            isLoading={loading}
            error={error}
            enrolledCourseIds={enrolledCourseIds}
          />
        )}
      </main>
      <Footer />
    </>
  );
};

export default MyCoursesPage;
