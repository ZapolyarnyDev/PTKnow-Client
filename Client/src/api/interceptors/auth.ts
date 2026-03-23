/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../axiosConfig';
import type { AxiosRequestConfig } from 'axios';

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

export const setupAuthInterceptor = () => {
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    const requestUrl = config.url || '';
    const isAuthRequest =
      requestUrl.includes('/v0/auth/login') ||
      requestUrl.includes('/v0/auth/register') ||
      requestUrl.includes('/v0/token/refresh');
    if (token && !isAuthRequest) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config as AxiosRequestConfigWithRetry;

      const requestUrl = originalRequest.url || '';
      const isAuthRequest =
        requestUrl.includes('/v0/auth/login') ||
        requestUrl.includes('/v0/auth/register') ||
        requestUrl.includes('/v0/token/refresh');

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthRequest
      ) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers!['Authorization'] = `Bearer ${token}`;
                resolve(api(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await api.post('/v0/token/refresh');
          const newAccessToken =
            (typeof response.data === 'string' && response.data.trim()) ||
            response.data.accessToken;

          localStorage.setItem('accessToken', newAccessToken);
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          originalRequest.headers![
            'Authorization'
          ] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
