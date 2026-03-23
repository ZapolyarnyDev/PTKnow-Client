import { create } from 'zustand';
import { courseCardApi } from '../api';
import type { CourseDTO } from '../types/CourseCard';

interface CourseState {
  course: CourseDTO | null;
  loading: boolean;
  error: string | null;
  fetchCourse: (id: number) => Promise<void>;
  clearCourse: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  course: null,
  loading: false,
  error: null,

  fetchCourse: async (id: number) => {
    const { course } = get();
    if (course?.id === id) return;

    set({ loading: true, error: null });
    try {
      const data = await courseCardApi.getCourseById(id);
      set({ course: data, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка загрузки курса';
      set({ error: message, loading: false });
    }
  },

  clearCourse: () => set({ course: null, error: null }),
}));
