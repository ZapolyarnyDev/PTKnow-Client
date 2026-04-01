import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { CourseList } from '../Components/CourseList';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import styles from '../styles/pages/CoursesPage.module.css';

const CoursesPage: React.FC = () => {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState('all');
  const { enrolledCourses } = useMyEnrollments();
  const enrolledIds = useMemo(
    () => enrolledCourses.map(course => course.id),
    [enrolledCourses]
  );

  const filters = useMemo(
    () => [
      { id: 'all', label: 'Все направления' },
      { id: 'it', label: 'IT и программирование' },
      { id: 'design', label: 'Дизайн' },
      { id: 'languages', label: 'Языки' },
      { id: 'music', label: 'Музыка' },
      { id: 'sports', label: 'Спорт' },
    ],
    []
  );

  const handleFilterClick = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  return (
    <>
      <Header />
      <div className={styles.coursesFilter}>
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`${styles.filterButton} ${
              activeFilter === filter.id ? styles.filterButtonActive : ''
            }`}
            onClick={() => handleFilterClick(filter.id)}
            type="button"
            aria-pressed={activeFilter === filter.id}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className={styles.container}>
        <div className={styles.pageHeader}></div>
        <CourseList key={`courses-${location.key}`} enrolledCourseIds={enrolledIds} />
      </div>
      <Footer />
    </>
  );
};

export default CoursesPage;
