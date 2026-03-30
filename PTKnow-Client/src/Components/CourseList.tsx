import { useCallback, useMemo, useState } from 'react';
import { useCourse } from '../hooks/useCourse';
import styles from '../styles/components/CourseList.module.css';
import { CourseCard } from './CourseCard';

interface CourseListProps {
  limit?: number;
  showLoadMore?: boolean;
}

export const CourseList: React.FC<CourseListProps> = ({
  limit,
  showLoadMore = true,
}) => {
  const { course, loading, error } = useCourse();
  const [visibleCount, setVisibleCount] = useState(limit || 6);

  const displayCourses = useMemo(() => course, [course]);
  const visibleCourses = useMemo(
    () => displayCourses.slice(0, visibleCount),
    [displayCourses, visibleCount]
  );
  const displayLoading = useMemo(() => loading, [loading]);
  const displayError = useMemo(() => error, [error]);

  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => prev + (limit || 6));
  }, [limit]);

  if (displayLoading) {
    return <div className={styles.loading}>Загрузка курсов...</div>;
  }

  if (displayError) {
    return (
      <div className={styles.error}>Ошибка загрузки курсов: {displayError}</div>
    );
  }

  return (
    <div className={styles.courseList}>
      {visibleCourses.map(courseItem => (
        <CourseCard key={courseItem.id} {...courseItem} />
      ))}

      {showLoadMore && displayCourses.length > visibleCount && (
        <button className={styles.showMoreButton} onClick={handleShowMore}>
          Показать еще ({displayCourses.length - visibleCount})
        </button>
      )}
    </div>
  );
};
