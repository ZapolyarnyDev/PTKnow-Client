import { api } from '../axiosConfig';
import type {
  AdminUserDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
} from '../../types/user';

export const usersApi = {
  getUsers: async (): Promise<AdminUserDTO[]> => {
    const response = await api.get('/v0/users');
    return response.data;
  },
  getUserById: async (id: string): Promise<AdminUserDTO> => {
    const response = await api.get(`/v0/users/${id}`);
    return response.data;
  },
  updateUserStatus: async (
    id: string,
    data: UpdateUserStatusDTO
  ): Promise<AdminUserDTO> => {
    const response = await api.patch(`/v0/users/${id}/status`, data);
    return response.data;
  },
  updateUserRole: async (
    id: string,
    data: UpdateUserRoleDTO
  ): Promise<AdminUserDTO> => {
    const response = await api.patch(`/v0/users/${id}/role`, data);
    return response.data;
  },
};
