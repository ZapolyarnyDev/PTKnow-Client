import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import type {
  User,
  LoginData,
  RegisterData,
  RegistrationDTO,
} from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const buildFullName = (
    firstName: string,
    lastName: string,
    middleName?: string
  ): string => {
    return `${lastName} ${firstName}${
      middleName ? ` ${middleName}` : ''
    }`.trim();
  };

  const parseFullName = (fullName: string) => {
    const parts = fullName.split(' ');
    return {
      lastName: parts[0] || '',
      firstName: parts[1] || '',
      middleName: parts[2] || '',
    };
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = err as { response?: { data?: { message?: string } } };
      return response.response?.data?.message || fallback;
    }
    if (err instanceof Error) {
      return err.message || fallback;
    }
    return fallback;
  };

  const login = useCallback(async (data: LoginData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(data);
      setUser(response.user);
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Ошибка входа'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const registerData: RegistrationDTO = {
        fullName: buildFullName(data.firstName, data.lastName, data.middleName),
        email: data.email,
        password: data.password,
      };

      const response = await authAPI.register(registerData);
      setUser(response.user);
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Ошибка регистрации'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (logoutError) {
      console.error('Ошибка при выходе:', logoutError);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      return false;
    }

    setIsLoading(true);
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
      return true;
    } catch (authError: unknown) {
      if (
        typeof authError === 'object' &&
        authError !== null &&
        'response' in authError &&
        (authError as { response?: { status?: number } }).response?.status ===
          401
      ) {
        localStorage.removeItem('accessToken');
      }
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    initializeAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    error,
    isInitialized,
    login,
    register,
    logout,
    checkAuth,
    parseFullName,
  };
};
