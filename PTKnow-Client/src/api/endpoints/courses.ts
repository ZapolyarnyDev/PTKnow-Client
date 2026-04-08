import type {
  CourseDTO,
  CourseTeacherDTO,
  CreateCourseDTO,
  EnrollmentDTO,
  UpdateCourseDTO,
  UpdateCourseTeacherDTO,
} from '../../types/CourseCard';
import { api } from '../axiosConfig';

export const courseCardApi = {
  getAllCourses: async (): Promise<CourseDTO[]> => {
    const response = await api.get('/v1/course');
    const payload = response.data as unknown;
    if (Array.isArray(payload)) {
      return payload as CourseDTO[];
    }
    if (payload && typeof payload === 'object') {
      const data = payload as {
        items?: CourseDTO[];
        courses?: CourseDTO[];
        data?: CourseDTO[];
        content?: CourseDTO[];
      };
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.courses)) return data.courses;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.content)) return data.content;
    }
    return [];
  },

  createCourse: async (
    courseData: CreateCourseDTO,
    preview?: File
  ): Promise<CourseDTO> => {
    const formData = new FormData();

    formData.append(
      'course',
      new Blob([JSON.stringify(courseData)], {
        type: 'application/json',
      })
    );

    if (preview) {
      formData.append('preview', preview);
    }
    const response = await api.post('/v1/course', formData);
    return response.data;
  },

  getCourseById: async (id: number): Promise<CourseDTO> => {
    const response = await api.get(`/v1/course/id/${String(id)}`);
    return response.data;
  },

  getCourseByHandle: async (handle: string): Promise<CourseDTO> => {
    const response = await api.get(`/v1/course/handle/${handle}`);
    return response.data;
  },

  updateCourse: async (
    id: number,
    data: UpdateCourseDTO
  ): Promise<CourseDTO> => {
    const response = await api.patch(`/v1/course/${String(id)}`, data);
    return response.data;
  },

  replaceCourse: async (
    id: number,
    data: UpdateCourseDTO
  ): Promise<CourseDTO> => {
    const response = await api.put(`/v1/course/${String(id)}`, data);
    return response.data;
  },

  updateCoursePreview: async (id: number, file: File): Promise<CourseDTO> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/v1/course/${String(id)}/preview`,
      formData
    );
    return response.data;
  },

  publishCourse: async (id: number): Promise<CourseDTO> => {
    const response = await api.post(`/v1/course/${String(id)}/publish`);
    return response.data;
  },

  archiveCourse: async (id: number): Promise<CourseDTO> => {
    const response = await api.post(`/v1/course/${String(id)}/archive`);
    return response.data;
  },

  enrollInCourse: async (id: number): Promise<EnrollmentDTO> => {
    const response = await api.post(`/v1/course/${String(id)}/enroll`);
    return response.data;
  },

  cancelEnrollment: async (id: number): Promise<void> => {
    await api.delete(`/v1/course/${String(id)}/enroll`);
  },

  addCourseTeacher: async (
    id: number,
    data: UpdateCourseTeacherDTO
  ): Promise<CourseTeacherDTO> => {
    const response = await api.post(`/v1/course/${String(id)}/teachers`, data);
    return response.data;
  },

  removeCourseTeacher: async (id: number, teacherId: string): Promise<void> => {
    await api.delete(`/v1/course/${String(id)}/teachers/${teacherId}`);
  },

  addCourseEditor: async (
    id: number,
    userId: string
  ): Promise<CourseTeacherDTO> => {
    const response = await api.post(
      `/v1/course/${String(id)}/editors/${userId}`
    );
    return response.data;
  },

  removeCourseEditor: async (id: number, userId: string): Promise<void> => {
    await api.delete(`/v1/course/${String(id)}/editors/${userId}`);
  },

  getCourseTeachers: async (id: number): Promise<CourseTeacherDTO[]> => {
    const response = await api.get(`/v1/course/${String(id)}/teachers`);
    return response.data;
  },

  getCourseStudents: async (id: number): Promise<EnrollmentDTO[]> => {
    const response = await api.get(`/v1/course/${String(id)}/students`);
    return response.data;
  },

  getCourseMembers: async (id: number): Promise<EnrollmentDTO[]> => {
    const response = await api.get(`/v1/course/${String(id)}/members`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/v1/course/${String(id)}`);
  },
};
