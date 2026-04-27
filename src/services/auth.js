import api from './api';

/**
 * Auth API surface + token/user storage helpers.
 *
 * Token + user are persisted to localStorage so a refresh keeps the user
 * logged in. AuthContext is the only thing that should call set/clear —
 * components should read state from useAuth().
 */

const TOKEN_KEY = 'iot_token';
const USER_KEY = 'iot_user';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const userStore = {
  get: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(USER_KEY),
};

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),

  changeMyPassword: (currentPassword, newPassword) =>
    api
      .put('/auth/me/password', { currentPassword, newPassword })
      .then((r) => r.data),

  // Admin-only —---------------------------------------------------------
  signup: ({ email, password, role }) =>
    api.post('/auth/signup', { email, password, role }).then((r) => r.data),

  listUsers: () => api.get('/auth/users').then((r) => r.data),

  resetUserPassword: (id, newPassword) =>
    api
      .put(`/auth/users/${id}/password`, { newPassword })
      .then((r) => r.data),

  deleteUser: (id) => api.delete(`/auth/users/${id}`).then((r) => r.data),
};
