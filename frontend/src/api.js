import axios from 'axios';

// Determine backend origin dynamically
// In dev: VITE_API_BASE_URL = http://localhost:6013/api → backend is http://localhost:6013
// In prod: same domain, so relative paths work via Nginx
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`;
const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate a persistent guest session ID if one doesn't exist
let guestSessionId = localStorage.getItem('guestSessionId');
if (!guestSessionId) {
  guestSessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('guestSessionId', guestSessionId);
}

// Console Formatting Interceptors & Guest Session
api.interceptors.request.use((config) => {
  if (guestSessionId) {
    config.headers['x-guest-session-id'] = guestSessionId;
  }
  console.log(`%c[API REQ] ${config.method.toUpperCase()} ${config.url}`, 'color: #046938; font-weight: bold;');
  return config;
}, (error) => {
  console.error(`%c[API REQ ERROR]`, 'color: #dc3545; font-weight: bold;', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  console.log(`%c[API RES] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`, 'color: #17a2b8; font-weight: bold;');
  return response;
}, (error) => {
  console.error(`%c[API RES ERROR]`, 'color: #dc3545; font-weight: bold;', error);
  return Promise.reject(error);
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
  // If frontend and backend are on different origins (dev mode), prepend backend origin
  const isSameOrigin = backendOrigin === window.location.origin || backendOrigin === '';
  if (isSameOrigin) {
    return safeEncodeUrl(cleanPath);
  }
  return safeEncodeUrl(`${backendOrigin}${cleanPath}`);
};

export default api;
