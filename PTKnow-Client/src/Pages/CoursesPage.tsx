import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { CourseList } from '../Components/CourseList';
import { courseCardApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import type { CourseDTO } from '../types/CourseCard';
import styles from '../styles/pages/CoursesPage.module.css';

const PAGE_SIZE = 12;

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
  const [selectedState, setSelectedState] = useState('');
  const [sort, setSort] = useState('id,desc');
  const [page, setPage] = useState(0);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const { enrolledCourses } = useMyEnrollments();
  const { user } = useAuth();

  const canFilterByState = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const enrolledIds = useMemo(
    () => enrolledCourses.map(course => course.id),
    [enrolledCourses]
  );

  useEffect(() => {
    if (!canFilterByState && selectedState) {
      setSelectedState('');
    }
  }, [canFilterByState, selectedState]);

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
          state: canFilterByState ? selectedState || undefined : undefined,
        });

        if (cancelled) {
          return;
        }

        setCourses(response.items);
        setHasNext(response.hasNext);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Не удалось загрузить курсы.'
          );
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
  }, [canFilterByState, page, selectedState, sort, submittedQuery]);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroLabel}>Каталог курсов</p>
            <h1 className={styles.heroTitle}>Подберите направление для обучения</h1>
            <p className={styles.heroDescription}>
              Ищите по названию курса и сортируйте каталог так по направлениям
            </p>
          </div>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                className={styles.searchInput}
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Поиск по названию курса"
              />
            </div>
            <button className={styles.searchButton} type="submit">
              Найти
            </button>
          </form>

          <div className={styles.controlsRow}>
            {canFilterByState && (
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
            )}

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
        </section>

        <section className={styles.catalogSection}>
          <CourseList
            key={`courses-${location.key}-${page}-${selectedState}-${sort}-${submittedQuery}`}
            courses={courses}
            isLoading={loading}
            error={error}
            showLoadMore={false}
            enrolledCourseIds={enrolledIds}
            emptyTitle="Курсы не найдены"
            emptyDescription="Попробуйте изменить поисковый запрос или параметры сортировки."
          />

          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              type="button"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0 || loading}
              aria-label="Предыдущая страница"
            >
              ←
            </button>
            <span className={styles.paginationInfo}>
              {totalPages === 0 ? '0 / 1' : `${page + 1} / ${Math.max(totalPages, 1)}`}
            </span>
            <button
              className={styles.paginationButton}
              type="button"
              onClick={() => setPage(prev => prev + 1)}
              disabled={!hasNext || loading}
              aria-label="Следующая страница"
            >
              →
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CoursesPage;
