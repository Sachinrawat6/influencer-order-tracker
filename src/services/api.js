import axios from 'axios';
import { API_BASE_URL } from '../constants/index.js';

/**
 * Axios instance shared across the app.
 *
 * - baseURL: in dev we proxy `/api` via vite.config.js → staging backend.
 *   In a real build, set VITE_API_BASE_URL to the prod API origin.
 * - Request interceptor: attach Bearer token from localStorage if present.
 * - Response interceptor: on 401, broadcast an `auth:unauthorized` event so
 *   AuthContext can wipe state + redirect, without api.js importing React.
 */

const TOKEN_KEY = 'iot_token';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Notify the app — AuthContext clears state + router redirects.
      // Skip if the failing call is the login itself; otherwise the toast
      // would say "session expired" on a wrong-password attempt.
      const url = err.config?.url || '';
      if (!url.endsWith('/auth/login')) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(err);
  }
);

export const orderApi = {
  create: (payload) => api.post('/orders', payload).then((r) => r.data),
  getAll: () => api.get('/orders').then((r) => r.data),
  getOne: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  getPending: () => api.get('/orders/pending').then((r) => r.data),
  getProcessed: () => api.get('/orders/processed').then((r) => r.data),
  getStats: () => api.get('/orders/stats').then((r) => r.data),
  process: (id, shopifyOrderId) =>
    api.put(`/orders/${id}/process`, { shopifyOrderId }).then((r) => r.data),
  remove: (id) => api.delete(`/orders/${id}`).then((r) => r.data),
};

export default api;
