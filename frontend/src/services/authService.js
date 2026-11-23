import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('oilcrop_token', res.data.access_token);
      localStorage.setItem('oilcrop_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(name, email, password, role = 'analyst') {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data.access_token) {
      localStorage.setItem('oilcrop_token', res.data.access_token);
      localStorage.setItem('oilcrop_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('oilcrop_token');
    localStorage.removeItem('oilcrop_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('oilcrop_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('oilcrop_token');
  }
};
