import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { courseCardApi } from '../api';
import { CourseList } from '../Components/CourseList';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import type { CourseDTO } from '../types/CourseCard';
import styles from '../styles/pages/CoursesPage.module.css';

const PAGE_SIZE = 12;

const FILTERS = [
  { id: 'all', label: 'Все направления' },
  { id: 'it', label: 'IT и программирование' },
  { id: 'design', label: 'Дизайн' },
  { id: 'languages', label: 'Языки' },
  { id: 'music', label: 'Музыка' },
  { id: 'sports', label: 'Спорт' },
] as const;

const SORT_OPTIONS = [
  { value: 'id,desc', label: 'Сначала новые' },
  { value: 'name,asc', label: 'По названию A-Z' },
  { value: 'name,desc', label: 'По названию Z-A' },
  { value: 'state,asc', label: 'По статусу' },
] as const;

const STATE_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'PUBLISHED', label: 'Опубликованные' },
  { value: 'DRAFT', label: 'Черновики' },
  { value: 'ARCHIVED', label: 'Архивные' },
] as const;

const CoursesPage: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedState, setSelectedState] = useState('');
  const [sort, setSort] = useState('id,desc');
  const [page, setPage] = useState(0);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const { enrolledCourses } = useMyEnrollments();

  const enrolledIds = useMemo(
    () => enrolledCourses.map(course => course.id),
    [enrolledCourses]
  );

  const handleFilterClick = useCallback((filterId: string) => {
    setActiveFilter(filterId);
    setPage(0);
  }, []);

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmittedQuery(searchQuery.trim());
      setPage(0);
    },
    [searchQuery]
  );

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await courseCardApi.getAllCourses({
          page,
          size: PAGE_SIZE,
          sort,
          q: submittedQuery || undefined,
          state: selectedState || undefined,
          tag: activeFilter === 'all' ? undefined : activeFilter,
        });

        if (cancelled) {
          return;
        }

        setCourses(response.items);
        setHasNext(response.hasNext);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки курсов');
          setCourses([]);
          setHasNext(false);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [activeFilter, page, selectedState, sort, submittedQuery]);

  return (
    <>
      <Header />
      <div className={styles.controls}>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <input
            className={styles.searchInput}
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Поиск по названию курса"
          />
          <button className={styles.searchButton} type="submit">
            Найти
          </button>
        </form>

        <div className={styles.selects}>
          <select
            className={styles.select}
            value={selectedState}
            onChange={event => {
              setSelectedState(event.target.value);
              setPage(0);
            }}
          >
            {STATE_OPTIONS.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={sort}
            onChange={event => {
              setSort(event.target.value);
              setPage(0);
            }}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.coursesFilter}>
        {FILTERS.map(filter => (
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
        <CourseList
          key={`courses-${location.key}-${page}-${activeFilter}-${selectedState}-${sort}-${submittedQuery}`}
          courses={courses}
          isLoading={loading}
          error={error}
          showLoadMore={false}
          enrolledCourseIds={enrolledIds}
        />

        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            type="button"
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0 || loading}
          >
            Назад
          </button>
          <span className={styles.paginationInfo}>
            Страница {totalPages === 0 ? 0 : page + 1} из {Math.max(totalPages, 1)}
          </span>
          <button
            className={styles.paginationButton}
            type="button"
            onClick={() => setPage(prev => prev + 1)}
            disabled={!hasNext || loading}
          >
            Далее
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CoursesPage;
