import type {
  CreateLessonDTO,
  LessonDTO,
  UpdateLessonDTO,
  UpdateLessonStateDTO,
} from '../../types/lesson';
import type { FileMetaDTO } from '../../types/CourseCard';
import { api } from '../axiosConfig';

export const lessonApi = {
  createLesson: async (
    courseId: number,
    data: CreateLessonDTO
  ): Promise<LessonDTO> => {
    const response = await api.post(`/v0/lessons/${String(courseId)}`, data);
    return response.data;
  },
  getLessonById: async (lessonId: number): Promise<LessonDTO> => {
    const response = await api.get(`/v0/lessons/${String(lessonId)}`);
    return response.data;
  },
  getCourseLessons: async (courseId: number): Promise<LessonDTO[]> => {
    const response = await api.get(`/v0/lessons/course/${String(courseId)}`);
    return response.data;
  },
  updateLesson: async (
    lessonId: number,
    data: UpdateLessonDTO
  ): Promise<LessonDTO> => {
    const response = await api.patch(`/v0/lessons/${String(lessonId)}`, data);
    return response.data;
  },
  replaceLesson: async (
    lessonId: number,
    data: UpdateLessonDTO
  ): Promise<LessonDTO> => {
    const response = await api.put(`/v0/lessons/${String(lessonId)}`, data);
    return response.data;
  },
  updateLessonState: async (
    lessonId: number,
    data: UpdateLessonStateDTO
  ): Promise<LessonDTO> => {
    const response = await api.patch(
      `/v0/lessons/${String(lessonId)}/state`,
      data
    );
    return response.data;
  },
  addLessonMaterials: async (
    lessonId: number,
    file: File
  ): Promise<FileMetaDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `/v0/lessons/${String(lessonId)}/materials`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
  deleteLessonMaterial: async (
    lessonId: number,
    fileId: number
  ): Promise<void> => {
    await api.delete(
      `/v0/lessons/${String(lessonId)}/materials/${String(fileId)}`
    );
  },
  deleteLesson: async (lessonId: number): Promise<void> => {
    await api.delete(`/v0/lessons/${String(lessonId)}`);
  },
};
