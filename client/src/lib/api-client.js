import axios from 'axios';
import toast from 'react-hot-toast';

// Auto-detect environment and use appropriate API URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

// Choose API URL based on environment and location
const API_URL = isLocalhost || isDevelopment 
  ? import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:5000'
  : import.meta.env.VITE_API_URL_PRODUCTION || 'https://boi-paben-backend.onrender.com';

console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode`);
console.log(`Using API URL: ${API_URL}`);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds default timeout
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set request priority if provided (can be 'high', 'normal', 'low')
    if (config.priority) {
      // Adjust timeout based on priority
      switch (config.priority) {
        case 'high':
          config.timeout = 15000; // 15 seconds for high priority
          break;
        case 'low':
          config.timeout = 45000; // 45 seconds for low priority
          break;
        default:
          config.timeout = 30000; // 30 seconds for normal priority
      }
      
      // Add priority as a custom header (could be used by server)
      config.headers['X-Request-Priority'] = config.priority;
      
      // Remove from final config
      delete config.priority;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;