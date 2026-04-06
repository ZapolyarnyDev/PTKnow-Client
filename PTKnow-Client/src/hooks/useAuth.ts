import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import type { ProfileResponseDTO } from '../types/profile';
import type {
  User,
  LoginData,
  RegisterData,
  RegistrationDTO,
} from '../types/user';

const normalizeRole = (role?: string | null) => {
  if (!role) {
    return '';
  }
  const upper = role.toUpperCase();
  return upper.startsWith('ROLE_') ? upper.slice(5) : upper;
};

const decodeJwtPayload = (
  token: string | null
): { role?: string; sub?: string } | null => {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '='
    );
    const decoded = atob(padded);
    const data = JSON.parse(decoded) as { role?: string; sub?: string };
    return data;
  } catch {
    return null;
  }
};

const buildUser = (
  profile: ProfileResponseDTO | null,
  token: string | null,
  existingUser?: User | null
): User | null => {
  if (!profile && !token && !existingUser) {
    return null;
  }
  const payload = decodeJwtPayload(token);
  const role = normalizeRole(
    profile?.role ?? payload?.role ?? existingUser?.role
  );

  return {
    id: existingUser?.id ?? profile?.id ?? '',
    email: existingUser?.email ?? profile?.email ?? payload?.sub ?? '',
    role: role || '',
    status: existingUser?.status ?? profile?.status ?? '',
    handle: profile?.handle ?? existingUser?.handle ?? '',
    fullName: profile?.fullName ?? existingUser?.fullName ?? '',
    avatarUrl: profile?.avatarUrl ?? existingUser?.avatarUrl ?? '',
  };
};

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
    const parsed = JSON.parse(storedUser) as User;
    const normalizedRole = normalizeRole(parsed.role);
    return normalizedRole && normalizedRole !== parsed.role
      ? { ...parsed, role: normalizedRole }
      : parsed;
  } catch {
    return null;
  }
};

const getStoredAccessToken = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (!token || token === 'undefined') {
    if (token === 'undefined') {
      localStorage.removeItem('accessToken');
    }
    return null;
  }
  return token;
};

const persistUser = (nextUser: User | null) => {
  if (nextUser) {
    const normalizedRole = normalizeRole(nextUser.role);
    const payload =
      normalizedRole && normalizedRole !== nextUser.role
        ? { ...nextUser, role: normalizedRole }
        : nextUser;
    localStorage.setItem('userData', JSON.stringify(payload));
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
      const tokenResponse = await authAPI.login(data);
      let token =
        typeof tokenResponse === 'string' && tokenResponse.trim()
          ? tokenResponse.trim()
          : getStoredAccessToken();
      if (!token) {
        try {
          await authAPI.refreshToken();
          token = getStoredAccessToken();
        } catch (refreshError) {
          console.warn('Failed to refresh token after login:', refreshError);
        }
      }
      let profile: ProfileResponseDTO | null = null;
      try {
        profile = await authAPI.getProfile();
      } catch (profileError) {
        console.warn('Failed to load profile after login:', profileError);
      }
      const nextUser = buildUser(profile, token, getStoredUser());
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
        recaptchaToken: data.recaptchaToken,
      };

      const tokenResponse = await authAPI.register(registerData);
      let token =
        typeof tokenResponse === 'string' && tokenResponse.trim()
          ? tokenResponse.trim()
          : getStoredAccessToken();
      if (!token) {
        const loginToken = await authAPI.login({
          email: data.email,
          password: data.password,
        });
        token =
          typeof loginToken === 'string' && loginToken.trim()
            ? loginToken.trim()
            : getStoredAccessToken();
        if (!token) {
          try {
            await authAPI.refreshToken();
            token = getStoredAccessToken();
          } catch (refreshError) {
            console.warn(
              'Failed to refresh token after registration:',
              refreshError
            );
          }
        }
      }
      let profile: ProfileResponseDTO | null = null;
      try {
        profile = await authAPI.getProfile();
      } catch (profileError) {
        console.warn(
          'Failed to load profile after registration:',
          profileError
        );
      }
      const nextUser = buildUser(profile, token, getStoredUser());
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
      let token = getStoredAccessToken();
      if (!token) {
        try {
          await authAPI.refreshToken();
          token = getStoredAccessToken();
        } catch (refreshError) {
          persistUser(null);
          setUser(null);
          return false;
        }
      }
      const profile = await authAPI.getProfile();
      const nextUser = buildUser(profile, token, getStoredUser());
      setUser(nextUser);
      persistUser(nextUser);
      return !!nextUser;
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
