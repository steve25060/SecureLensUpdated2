import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request interceptor: attach JWT ─────────────────────────── */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage is only available on the client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sl_token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

/* ── Response interceptor: handle 401 ───────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear stale credentials
      localStorage.removeItem('sl_token');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
