import axios from 'axios';

// Determine backend origin dynamically
// In dev: VITE_API_BASE_URL = http://localhost:6013/api/admin → backend is http://localhost:6013
// In prod: same domain, so relative paths work via Nginx
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api/admin`;
const backendOrigin = apiBaseUrl.replace(/\/api(\/admin)?\/?$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAssetUrl = (path) => {
  if (!path) return '';
  // Already a full URL — return as-is
  if (path.startsWith('http')) return path;

  const s3Base = import.meta.env.VITE_S3_BASE_URL;
  if (s3Base) {
    return `${s3Base}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If admin and backend are on different origins (dev mode), prepend backend origin
  const isSameOrigin = backendOrigin === window.location.origin || backendOrigin === '';
  if (isSameOrigin) {
    return cleanPath;
  }
  return `${backendOrigin}${cleanPath}`;
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
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
