import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`,
  withCredentials: true, // Send cookies/session with requests
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

export default api;
