import type {
  AuthResponse,
  LoginDTO,
  RegistrationDTO,
  User,
} from '../../types/user';
import type { TokenRefreshResponse } from '../../types/auth';
import { api } from '../axiosConfig';

export const authAPI = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post('/v0/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  register: async (data: RegistrationDTO): Promise<AuthResponse> => {
    const response = await api.post('/v0/auth/register', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/v0/auth/logout');
    localStorage.removeItem('accessToken');
  },

  refreshToken: async (): Promise<TokenRefreshResponse> => {
    const response = await api.post('/v0/token/refresh');
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/v0/profile/me');
    return response.data;
  },
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
