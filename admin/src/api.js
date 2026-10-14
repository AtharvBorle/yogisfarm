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

export const safeEncodeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  let encoded = '';
  try {
    encoded = encodeURI(decodeURI(url));
  } catch (e) {
    encoded = encodeURI(url);
  }
  const qIndex = encoded.indexOf('?');
  if (qIndex !== -1) {
    return encoded.slice(0, qIndex).replace(/#/g, '%23') + encoded.slice(qIndex);
  }
  return encoded.replace(/#/g, '%23');
};

export const getAssetUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return safeEncodeUrl(path);
  }

  const s3Base = import.meta.env.VITE_S3_BASE_URL;
  if (s3Base) {
    const cleanBase = s3Base.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return safeEncodeUrl(`${cleanBase}${cleanPath}`);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If admin and backend are on different origins (dev mode), prepend backend origin
  const isSameOrigin = backendOrigin === window.location.origin || backendOrigin === '';
  if (isSameOrigin) {
    return safeEncodeUrl(cleanPath);
  }
  return safeEncodeUrl(`${backendOrigin}${cleanPath}`);
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
      const loginPath = (import.meta.env.BASE_URL || '/') + 'login';
      if (!window.location.pathname.includes(loginPath)) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
