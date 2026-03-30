import { api } from '../api';
import type { CourseDTO } from '../types/CourseCard';
import type { ProfileResponseDTO } from '../types/profile';

const getBaseUrl = (): string => {
  const baseUrl = api.defaults.baseURL ?? '';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const stripApiSuffix = (baseUrl: string): string => {
  return baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
};

export const getFileUrl = (fileUrl?: string): string | null => {
  if (!fileUrl) {
    return null;
  }

  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }

  if (fileUrl.startsWith('/')) {
    const baseUrl = getBaseUrl();
    if (baseUrl && fileUrl.startsWith('/api/')) {
      return `${stripApiSuffix(baseUrl)}${fileUrl}`;
    }
    return baseUrl ? `${baseUrl}${fileUrl}` : fileUrl;
  }
  return fileUrl;
};

export const getAvatarUrl = (profile: ProfileResponseDTO): string | null => {
  return getFileUrl(profile.avatarUrl);
};

export const getCoursePreviewUrl = (course: CourseDTO): string | null => {
  return getFileUrl(course.previewUrl);
};
