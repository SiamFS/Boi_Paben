import axios from 'axios';
import toast from 'react-hot-toast';
import cache from './cache';

// Auto-detect environment and use appropriate API URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

// Choose API URL based on environment and location
const API_URL = isLocalhost || isDevelopment 
  ? import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:5000'
  : import.meta.env.VITE_API_URL_PRODUCTION || 'https://boi-paben-backend.onrender.com';

console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode`);
console.log(`Using API URL: ${API_URL}`);

// Track if we've shown the Render startup warning
let hasShownRenderWarning = false;
const isProduction = !isLocalhost && !isDevelopment;

// Cache configuration: which endpoints to cache and for how long (in seconds)
const CACHE_CONFIG = {
  '/api/books/all': 3600, // 1 hour
  '/api/books/latest': 3600, // 1 hour
  '/api/books/category': 3600, // 1 hour
  '/api/books/user': 1800, // 30 minutes
  '/api/blog/posts': 3600, // 1 hour
  '/api/blog/reactions': 1800, // 30 minutes
};

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
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = config.url;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        // Return cached response
        return Promise.reject({
          isFromCache: true,
          data: cachedData,
          status: 200,
          config,
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get') {
      const cacheKey = response.config.url;
      // Check if this endpoint should be cached
      const shouldCache = Object.keys(CACHE_CONFIG).some(pattern => {
        // Handle pattern matching for URLs with IDs
        return cacheKey.includes(pattern.split('/').slice(0, -1).join('/'));
      });
      
      if (shouldCache) {
        // Find matching cache config
        let ttl = 3600; // Default 1 hour
        for (const [pattern, duration] of Object.entries(CACHE_CONFIG)) {
          if (cacheKey.includes(pattern.replace(/^\//, ''))) {
            ttl = duration;
            break;
          }
        }
        cache.set(cacheKey, response.data, ttl);
      }
    }
    return response;
  },
  (error) => {
    // Handle cached request interception
    if (error.isFromCache) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        config: error.config,
        fromCache: true,
      });
    }

    const cacheKey = error.config?.url;
    const cachedData = cacheKey ? cache.get(cacheKey) : null;

    // Check if it's a connection error (server not responding - Render cold start)
    if (!error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.code === 'ECONNREFUSED')) {
      // Show appropriate message based on environment and cache availability
      if (cachedData) {
        // We have cache - show restart message
        if (isProduction && !hasShownRenderWarning) {
          hasShownRenderWarning = true;
          toast.loading(
            '⏳ Backend is restarting...\nThis usually takes less than 2 minutes.\nShowing cached content in the meantime.',
            {
              duration: 6000,
            }
          );
        } else if (!isProduction && !hasShownRenderWarning) {
          hasShownRenderWarning = true;
          toast.loading(
            '⏳ Backend is not responding...\nShowing cached content in the meantime.',
            {
              duration: 5000,
            }
          );
        }
        // Return cached data
        return Promise.resolve({
          data: cachedData,
          status: 200,
          fromCache: true,
          config: error.config,
        });
      } else {
        // No cache available - show error
        hasShownRenderWarning = true; // Prevent duplicate messages
        toast.error(
          '❌ Failed to connect to server.\nPlease check your connection or try again later.',
          {
            duration: 5000,
          }
        );
      }
    } else if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 500) {
      // Try cache for 500 errors
      if (cachedData) {
        toast.loading(
          'Server error detected. Showing cached content.',
          {
            duration: 4000,
          }
        );
        return Promise.resolve({
          data: cachedData,
          status: 200,
          fromCache: true,
          config: error.config,
        });
      }
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      // Generic network error - try cache
      if (cachedData) {
        toast.loading(
          'Network error. Showing cached content.',
          {
            duration: 4000,
          }
        );
        return Promise.resolve({
          data: cachedData,
          status: 200,
          fromCache: true,
          config: error.config,
        });
      }
      toast.error(
        '❌ Failed to connect to server.\nPlease check your connection or try again later.',
        {
          duration: 5000,
        }
      );
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;