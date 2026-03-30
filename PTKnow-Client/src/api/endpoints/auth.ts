import type { AuthResponse, LoginDTO, RegistrationDTO } from '../../types/user';
import type { ProfileResponseDTO } from '../../types/profile';
import type { TokenRefreshResponse } from '../../types/auth';
import { api } from '../axiosConfig';

const extractAccessTokenFromResponse = (response: {
  data?: unknown;
  headers?: Record<string, unknown> | null;
}): string | null => {
  const payload = response.data;
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }
  if (payload && typeof payload === 'object') {
    const data = payload as {
      accessToken?: string;
      access_token?: string;
      tokens?: { accessToken?: string };
    };
    const tokenFromBody =
      data.accessToken || data.access_token || data.tokens?.accessToken;
    if (tokenFromBody) {
      return tokenFromBody;
    }
  }

  const headers = response.headers || {};
  const authHeader =
    (headers as Record<string, unknown>).authorization ||
    (headers as Record<string, unknown>).Authorization;
  if (typeof authHeader === 'string') {
    const match = authHeader.match(/Bearer\s+(.*)/i);
    return match ? match[1] : authHeader;
  }

  return null;
};

const persistAccessToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const authAPI = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post('/v1/auth/login', data);
    const accessToken = extractAccessTokenFromResponse(response);
    persistAccessToken(accessToken);
    if (!accessToken) {
      try {
        await authAPI.refreshToken();
      } catch (error) {
        console.error('Failed to refresh token after login:', error);
      }
    }
    return response.data;
  },

  register: async (data: RegistrationDTO): Promise<AuthResponse> => {
    const response = await api.post('/v1/auth/register', data);
    const accessToken = extractAccessTokenFromResponse(response);
    persistAccessToken(accessToken);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/v1/auth/logout');
    persistAccessToken(null);
  },

  refreshToken: async (): Promise<TokenRefreshResponse> => {
    const response = await api.post('/v1/token/refresh');
    const accessToken = extractAccessTokenFromResponse(response);
    persistAccessToken(accessToken);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponseDTO> => {
    const response = await api.get('/v1/profile/me');
    return response.data;
  },
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
