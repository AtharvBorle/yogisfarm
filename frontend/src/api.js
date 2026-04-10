import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send cookies/session with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;
