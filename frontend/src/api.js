import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`,
  withCredentials: true, // Send cookies/session with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Console Formatting Interceptors
api.interceptors.request.use((config) => {
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

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Use relative paths in production to let Nginx handle the routing
  return `${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;
