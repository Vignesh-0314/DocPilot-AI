import axios from 'axios';

// Resolve Backend API URL dynamically from VITE_API_URL environment variable
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://docpilot-ai-nj60.onrender.com';
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');

// Ensure /api suffix is appended without duplication
const baseURL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('docpilot_token');
      localStorage.removeItem('docpilot_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
