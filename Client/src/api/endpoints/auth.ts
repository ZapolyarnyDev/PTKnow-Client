import type {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
} from '../../types/user';
import { api } from '../axiosConfig';

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/v0/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/v0/auth/register', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/v0/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/v0/auth/profile');
    return response.data;
  },
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
