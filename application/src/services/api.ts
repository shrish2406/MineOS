import axios, { type AxiosError } from 'axios';
import { Platform } from 'react-native';
import { getToken } from './storage';

/** Host machine LAN IPv4 — update if your network address changes (run `ipconfig`). */
const LOCAL_DEV_HOST = '10.106.149.199';

/**
 * Resolves the API base URL for the current platform.
 * - Android emulator / physical device: LAN IP reaches the host Express server
 * - iOS simulator: localhost works directly
 * - Override anytime with EXPO_PUBLIC_API_URL (e.g. http://192.168.1.10:5000/api)
 */
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const host = Platform.select({
    android: LOCAL_DEV_HOST,
    ios: 'localhost',
    default: LOCAL_DEV_HOST,
  });

  return `http://${host}:5000/api`;
}

export function formatApiError(error: unknown): Record<string, unknown> {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? { message: error.message, name: error.name }
      : { error };
  }

  const axiosError = error as AxiosError;
  const isNetworkError = !axiosError.response && Boolean(axiosError.request);
  const url = axiosError.config?.baseURL
    ? `${axiosError.config.baseURL}${axiosError.config.url ?? ''}`
    : axiosError.config?.url;

  return {
    message: axiosError.message,
    code: axiosError.code,
    isNetworkError,
    status: axiosError.response?.status,
    data: axiosError.response?.data,
    method: axiosError.config?.method?.toUpperCase(),
    url,
    timeout: axiosError.config?.timeout,
  };
}

export function logApiError(context: string, error: unknown): void {
  console.error(`[api] ${context}:`, formatApiError(error));
}

export const API_BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log('[api] Using base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    logApiError('Request failed', error);

    if (error.response?.status === 401) {
      const { clearSession } = await import('./storage');
      await clearSession();
    }
    return Promise.reject(error);
  },
);

export default api;
