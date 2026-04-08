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
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroLabel}>Личный кабинет</p>
            <h1 className={styles.heroTitle}>Мои курсы</h1>
            <p className={styles.heroDescription}>
              Здесь собраны все курсы, на которые вы уже записаны и к которым
              можно быстро вернуться
            </p>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{enrolledCourses.length}</span>
              <span className={styles.statLabel}>активных записей</span>
            </div>
          </div>
        </section>

        <section className={styles.catalogSection}>
          <CourseList
            showLoadMore={false}
            courses={enrolledCourseCards}
            isLoading={loading}
            error={error}
            enrolledCourseIds={enrolledCourseIds}
            emptyTitle="Вы пока не записаны ни на один курс"
            emptyDescription="Когда выберете интересный курс в каталоге, он появится здесь"
          />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MyCoursesPage;
