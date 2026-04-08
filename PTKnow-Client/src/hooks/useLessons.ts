import { useCallback, useState } from 'react';
import { filesAPI } from '../api/endpoints/file';
import { lessonApi } from '../api/endpoints/lesson';
import type { FileMetaDTO } from '../types/CourseCard';
import type { CreateLessonDTO, LessonDTO } from '../types/lesson';

export const useLesson = () => {
  const [lesson, setLesson] = useState<LessonDTO | null>(null);
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLessonById = useCallback(async (lessonId: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const lessonData = await lessonApi.getLessonById(lessonId);
      setLesson(lessonData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка загрузки урока';
      setError(errorMessage);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLesson = useCallback(
    async (
      courseId: number,
      lessonData: CreateLessonDTO
    ): Promise<LessonDTO> => {
      setLoading(true);
      setError(null);

      try {
        const newLesson = await lessonApi.createLesson(courseId, lessonData);
        setLessons(prev => [...prev, newLesson]);
        return newLesson;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка создания урока';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCourseLessons = useCallback(
    async (courseId: number): Promise<void> => {
      setLoading(true);
      setError(null);

    try {
      const lessonsData = await lessonApi.getCourseLessons(courseId);
      setLessons(lessonsData);
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = err as { response?: { status?: number } };
        const status = response.response?.status;
        if (status === 403) {
          setLessons([]);
          setError('Уроки доступны после записи на курс');
          return;
        }
      }
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка загрузки уроков курса';
      setError(errorMessage);
      throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteLesson = useCallback(
    async (lessonId: number): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await lessonApi.deleteLesson(lessonId);
        setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
        if (lesson?.id === lessonId) {
          setLesson(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка удаления урока';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [lesson]
  );

  const addLessonMaterial = useCallback(
    async (lessonId: number, file: File): Promise<FileMetaDTO> => {
      setLoading(true);
      setError(null);

      try {
        const fileId = await lessonApi.addLessonMaterials(lessonId, file);
        return await filesAPI.getFileMeta(fileId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка загрузки материала урока';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const clearError = useCallback((): void => setError(null), []);
  const clearLesson = useCallback((): void => setLesson(null), []);

  return {
    lesson,
    lessons,
    loading,
    error,

    getLessonById,
    createLesson,
    getCourseLessons,
    deleteLesson,
    addLessonMaterial,
    clearError,
    clearLesson,
  };
};
