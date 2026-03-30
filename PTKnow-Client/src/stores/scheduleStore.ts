import { create } from 'zustand';
import type { LessonDTO } from '../types/lesson';

interface LessonState {
  lessons: LessonDTO[];
  selectedDate: string;

  setLesson: (lessons: LessonDTO[]) => void;
  setSelectedDate: (date: string) => void;
}

export const useLessonStore = create<LessonState>(set => ({
  lessons: [],
  selectedDate: '',

  setLesson: lessons => set({ lessons }),
  setSelectedDate: date => set({ selectedDate: date }),
}));
