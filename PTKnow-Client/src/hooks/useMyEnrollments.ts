import { useCallback, useEffect, useState } from 'react';
import type { CourseSummaryDTO } from '../types/CourseCard';
import { profileApi } from '../api/endpoints/profile';

export const useMyEnrollments = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseSummaryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'undefined') {
      setEnrolledCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await profileApi.getMyProfile();
      setEnrolledCourses(profile.enrolledCourses ?? []);
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = err as { response?: { status?: number } };
        if (response.response?.status === 401) {
          setEnrolledCourses([]);
          return;
        }
      }
      setError('Не удалось загрузить список записей на курсы.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrolledCourses,
    loading,
    error,
    refetch: fetchEnrollments,
  };
};
