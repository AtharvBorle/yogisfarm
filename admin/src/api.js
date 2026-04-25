import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api/admin`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Use relative paths in production to let Nginx handle the routing
  return `${path.startsWith('/') ? '' : '/'}${path}`;
};

api.interceptors.request.use((config) => {
  console.log(`%c[ADMIN API REQ] ${config.method.toUpperCase()} ${config.url}`, 'color: #007bff; font-weight: bold;');
  return config;
}, (error) => {
  console.error(`%c[ADMIN API REQ ERROR]`, 'color: #dc3545; font-weight: bold;', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log(`%c[ADMIN API RES] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`, 'color: #28a745; font-weight: bold;');
    return response;
  },
  (error) => {
    console.error(`%c[ADMIN API RES ERROR]`, 'color: #dc3545; font-weight: bold;', error);
    if (error.response && error.response.status === 401) {
      // Clear cookie/session implicitly by enforcing login redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
