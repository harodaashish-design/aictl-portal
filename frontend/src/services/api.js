import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('aicte_token') || sessionStorage.getItem('aicte_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const currentPath = window.location.pathname;
      const isAuthRoute =
        currentPath.includes('/login') ||
        currentPath.includes('/register') ||
        currentPath.includes('/forgot-password') ||
        currentPath.includes('/reset-password');

      if (!isAuthRoute && (localStorage.getItem('aicte_token') || sessionStorage.getItem('aicte_token'))) {
        localStorage.removeItem('aicte_token');
        localStorage.removeItem('aicte_user');
        sessionStorage.removeItem('aicte_token');
        sessionStorage.removeItem('aicte_user');
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return 'Cannot reach backend server (http://localhost:5000). Please ensure the backend is started.';
  }
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
