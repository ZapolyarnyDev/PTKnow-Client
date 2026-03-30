import type { UserStatus } from './user';

export interface ProfileResponseDTO {
  fullName: string;
  summary: string;
  handle: string;
  avatarUrl: string;
  id?: string;
  status?: UserStatus;
  role?: string;
  course?: number;
  numberGroup?: string;
  email?: string;
}

export interface ProfileUpdateDTO {
  fullName: string;
  summary: string;
  handle: string;
  avatarUrl: string;
}
