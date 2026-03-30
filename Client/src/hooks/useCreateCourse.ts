import { useState } from 'react';
import { courseCardApi } from '../api';
import type { CreateCourseDTO, CourseDTO } from '../types/CourseCard';



export const useCreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCourse, setCreatedCourse] = useState<CourseDTO | null>(null);

  const createCourse = async (courseData: CreateCourseDTO, preview?: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const course = await courseCardApi.createCourse(courseData, preview);
      setCreatedCourse(course);
      return course;
    } catch (err) {
      let errorMessage =
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при создании курса';

      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = err as {
          response?: { data?: { message?: string } | string; status?: number };
        };
        const data = response.response?.data;
        if (typeof data === 'string' && data.trim()) {
          errorMessage = data;
        } else if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          data.message
        ) {
          errorMessage = String(data.message);
        }
      }

      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCreatedCourse(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    createCourse,
    isLoading,
    error,
    createdCourse,
    reset,
    isSuccess: !!createCourse,
  };
};
