import { api } from '../axiosConfig';
import type {
  AdminUserDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
} from '../../types/user';

export const usersApi = {
  getUsers: async (): Promise<AdminUserDTO[]> => {
    const response = await api.get('/v1/users');
    const payload = response.data as unknown;
    if (Array.isArray(payload)) {
      return payload as AdminUserDTO[];
    }
    if (payload && typeof payload === 'object') {
      const data = payload as {
        items?: AdminUserDTO[];
        data?: AdminUserDTO[];
        content?: AdminUserDTO[];
      };
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.content)) return data.content;
    }
    return [];
  },
  getUserById: async (id: string): Promise<AdminUserDTO> => {
    const response = await api.get(`/v1/users/${id}`);
    return response.data;
  },
  updateUserStatus: async (
    id: string,
    data: UpdateUserStatusDTO
  ): Promise<AdminUserDTO> => {
    const response = await api.patch(`/v1/users/${id}/status`, data);
    return response.data;
  },
  updateUserRole: async (
    id: string,
    data: UpdateUserRoleDTO
  ): Promise<AdminUserDTO> => {
    const response = await api.patch(`/v1/users/${id}/role`, data);
    return response.data;
  },
};
