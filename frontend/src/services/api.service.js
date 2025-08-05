import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: credentials => api.post('/auth/login', credentials),
  register: userData => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/users/me'),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  requestPasswordReset: email => api.post('/auth/request-reset', { email })
};

export default api;