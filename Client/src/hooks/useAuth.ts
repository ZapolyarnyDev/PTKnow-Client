import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import type {
  User,
  LoginData,
  RegisterData,
  RegistrationDTO,
} from '../types/user';

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('userData');
  if (!storedUser) {
    return null;
  }
  if (storedUser === 'undefined') {
    localStorage.removeItem('userData');
    return null;
  }
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

const persistUser = (nextUser: User | null) => {
  if (nextUser) {
    localStorage.setItem('userData', JSON.stringify(nextUser));
  } else {
    localStorage.removeItem('userData');
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
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

  const getErrorMessage = (
    err: unknown,
    fallback: string,
    conflictMessage?: string
  ) => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = err as {
        response?: { data?: { message?: string } | string; status?: number };
      };
      const status = response.response?.status;
      if (status === 409 && conflictMessage) {
        return conflictMessage;
      }
      const data = response.response?.data;
      if (typeof data === 'string') {
        return status ? `${data} (${status})` : data;
      }
      if (
        data &&
        typeof data === 'object' &&
        'message' in data &&
        data.message
      ) {
        return status ? `${data.message} (${status})` : data.message;
      }
      return status ? `${fallback} (${status})` : fallback;
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
      const nextUser = response?.user ?? null;
      setUser(nextUser);
      persistUser(nextUser);
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

      let response = await authAPI.register(registerData);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        response = await authAPI.login({
          email: data.email,
          password: data.password,
        });
      }
      const nextUser = response?.user ?? null;
      setUser(nextUser);
      persistUser(nextUser);
      return true;
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Ошибка регистрации',
          'Пользователь уже зарегистрирован.'
        )
      );
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
      persistUser(null);
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData = await authAPI.getProfile();
      const nextUser = userData ?? null;
      setUser(nextUser);
      persistUser(nextUser);
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
      persistUser(null);
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
