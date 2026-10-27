import axios from 'axios';

// One axios instance — attaches token from localStorage on every request
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('contentos:token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Redirect to /login on 401 (session expired or missing)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('contentos:token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
