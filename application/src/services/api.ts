import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './storage';

/** Host machine LAN IPv4 — update when your network changes (run `ipconfig`). */
const LOCAL_DEV_HOST = '10.106.149.199';
const BACKEND_PORT = 5000;

/**
 * Resolves the API base URL for the current platform.
 * - Override any time with EXPO_PUBLIC_API_URL (e.g. http://192.168.1.10:5000/api)
 * - Android emulator: 10.0.2.2 reaches the host machine from the emulator
 * - iOS simulator: localhost reaches the host machine directly
 * - Physical device: LAN IP so the phone can reach your computer on the same Wi-Fi
 */
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const host = Platform.select({
    android: LOCAL_DEV_HOST,
    ios: LOCAL_DEV_HOST,
    default: LOCAL_DEV_HOST,
  });

  return `http://${host}:${BACKEND_PORT}/api`;
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
    networkHint: isNetworkError
      ? `Cannot reach ${url ?? API_BASE_URL}. Start the backend and ensure the phone is on the same Wi-Fi network.`
      : undefined,
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
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // React Native's FormData sometimes fails the standard 'instanceof FormData' check.
  // Checking for '_parts' ensures we correctly identify it in React Native.
  const isFormData = config.data instanceof FormData || (config.data && config.data._parts);

  if (isFormData) {
    if (config.headers) {
      // Axios docs strictly advise AGAINST setting Content-Type for FormData in React Native.
      // We must delete the default 'application/json' header so React Native can automatically
      // generate the 'multipart/form-data' header with the required boundary string.
      delete config.headers['Content-Type'];
      
      // Support for Axios v1+ which uses AxiosHeaders instances
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    logApiError('Request failed', error);

    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['minsos_token', 'minsos_user', 'minsos_selected_mine']);
    }
    return Promise.reject(error);
  },
);

export default api;
