import { api } from '../axiosConfig';
import type { FileMetaDTO } from '../../types/CourseCard';

export const filesAPI = {
  getFile: async (fileId: number): Promise<Blob> => {
    const response = await api.get(`/v0/files/${String(fileId)}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  getFileMeta: async (fileId: number): Promise<FileMetaDTO> => {
    const response = await api.get(`/v0/files/${String(fileId)}/meta`);
    return response.data;
  },
  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/v0/files/${String(fileId)}`);
  },
  getFileUrl: (fileId: number): string => {
    const baseUrl = api || '';
    return `${baseUrl}/v0/files/${String(fileId)}`;
  },
};
