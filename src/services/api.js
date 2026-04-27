import axios from 'axios';

/**
 * Axios instance shared across the app.
 *
 * Base URL resolution:
 *   - In production (e.g. Netlify build) set VITE_API_BASE_URL to your API
 *     origin. Both formats work — with or without the `/api` suffix:
 *       https://cutting-qrcode-api.qurvii.com
 *       https://cutting-qrcode-api.qurvii.com/api
 *   - In dev (no env var) we fall back to `/api` and rely on vite.config.js
 *     to proxy that to the staging backend.
 *
 * Interceptors:
 *   - Request: attach Bearer token from localStorage if present.
 *   - Response: on 401 (except the login call itself), broadcast an
 *     `auth:unauthorized` event so AuthContext can wipe state and the
 *     router can redirect to /login.
 */

const TOKEN_KEY = 'iot_token';

const resolveBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
  // Strip a single trailing slash for predictable joining.
  const stripped = raw.replace(/\/+$/, '');
  // If the caller already included `/api`, leave it alone. Otherwise append.
  return /\/api$/.test(stripped) ? stripped : `${stripped}/api`;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
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
      const url = err.config?.url || '';
      // Skip the login call so a wrong-password attempt doesn't show
      // "session expired".
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
