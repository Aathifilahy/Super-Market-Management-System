import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import {
  AuthContextType,
  AuthResponse,
  JwtPayload,
  LoginFormData,
  RegisterFormData,
  User,
} from '../types/auth';

const STORAGE_KEY_TOKEN = 'supermarket_auth_token';
const STORAGE_KEY_USER = 'supermarket_auth_user';
const STORAGE_KEY_PERSIST = 'supermarket_auth_persist';

type PersistMode = 'local' | 'session';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function getTokenExpiryMs(token: string): number | null {
  const payload = parseJwt(token);
  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
}

function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }

      const validationErrors = (data as { errors?: Record<string, string[] | string> }).errors;
      if (validationErrors && typeof validationErrors === 'object') {
        const messages = Object.values(validationErrors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

        if (messages.length > 0) {
          return messages.join(' ');
        }
      }

      const title = (data as { title?: unknown }).title;
      if (typeof title === 'string' && title.trim().length > 0) {
        return title;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function saveAuthToStorage(token: string, user: User, persistMode: PersistMode): void {
  sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
  sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_PERSIST);
}

function clearAuthFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  sessionStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_PERSIST);
}

function readAuthFromStorage(): { token: string; user: User } | null {
  const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
  const userRaw = sessionStorage.getItem(STORAGE_KEY_USER);

  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as User;
    return { token, user };
  } catch {
    return null;
  }
}

function getPersistMode(): PersistMode {
  return 'session';
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const logoutTimerRef = useRef<number | null>(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearLogoutTimer();
    setUser(null);
    setToken(null);
    setError(null);
    delete api.defaults.headers.common.Authorization;
    clearAuthFromStorage();
  }, [clearLogoutTimer]);

  const scheduleAutoLogout = useCallback(
    (jwtToken: string) => {
      clearLogoutTimer();

      const expiryMs = getTokenExpiryMs(jwtToken);
      if (!expiryMs) {
        logout();
        return;
      }

      const timeout = expiryMs - Date.now();
      if (timeout <= 0) {
        logout();
        return;
      }

      logoutTimerRef.current = window.setTimeout(() => {
        logout();
      }, timeout);
    },
    [clearLogoutTimer, logout]
  );

  const setAuth = useCallback(
    (nextUser: User, nextToken: string, persistMode: PersistMode = getPersistMode()) => {
      setUser(nextUser);
      setToken(nextToken);
      setError(null);
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      saveAuthToStorage(nextToken, nextUser, persistMode);
      scheduleAutoLogout(nextToken);
    },
    [scheduleAutoLogout]
  );

  const setAuthForContext = useCallback(
    (nextUser: User, nextToken: string) => {
      setAuth(nextUser, nextToken);
    },
    [setAuth]
  );

  const login = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post<AuthResponse>('/auth/login', {
          email: data.email,
          password: data.password,
        });

        const persistMode: PersistMode = data.rememberMe ? 'local' : 'session';
        setAuth(response.data.user, response.data.token, persistMode);
      } catch (err) {
        const message = parseApiError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  const register = useCallback(
    async (data: RegisterFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        await api.post<User>('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role,
          address: data.address,
          phone: data.phone,
        });

        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });
      } catch (err) {
        const message = parseApiError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const storedAuth = readAuthFromStorage();

    if (!storedAuth) {
      setIsLoading(false);
      return;
    }

    const expiryMs = getTokenExpiryMs(storedAuth.token);
    if (!expiryMs || expiryMs <= Date.now()) {
      logout();
      setIsLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${storedAuth.token}`;
    setUser(storedAuth.user);
    setToken(storedAuth.token);
    scheduleAutoLogout(storedAuth.token);
    setIsLoading(false);
  }, [logout, scheduleAutoLogout]);

  useEffect(() => {
    return () => {
      clearLogoutTimer();
    };
  }, [clearLogoutTimer]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      login,
      register,
      logout,
      setAuth: setAuthForContext,
      clearError,
    }),
    [user, token, isLoading, error, login, register, logout, setAuthForContext, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
