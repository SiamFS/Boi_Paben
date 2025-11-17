import axios from 'axios';
import toast from 'react-hot-toast';
import cache from './cache';

// Auto-detect environment and use appropriate API URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

// Choose API URL based on ACTUAL hostname, not env variable
// If running on localhost, use local API. If on deployed domain, use production API
const API_URL = isLocalhost
  ? import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:5000'
  : import.meta.env.VITE_API_URL_PRODUCTION || 'https://boi-paben-backend.onrender.com';

console.log(`Running on: ${window.location.hostname}`);
console.log(`Using API URL: ${API_URL}`);
console.log(`Mode: ${import.meta.env.MODE}`);

// Track if we've shown backend error message in this session (show only once)
let hasShownBackendError = false;
let firstRequestTime = null;
let pendingRequests = new Set();
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
  timeout: 120000, // 120 seconds (2 minutes) for Render cold starts
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Track first request time
    if (!firstRequestTime) {
      firstRequestTime = Date.now();
    }
    
    // Track pending request
    const requestId = Math.random().toString(36);
    pendingRequests.add(requestId);
    config.__requestId = requestId;
    
    // Set request priority if provided (can be 'high', 'normal', 'low')
    if (config.priority) {
      // Adjust timeout based on priority - longer for production/Render
      switch (config.priority) {
        case 'high':
          config.timeout = isProduction ? 90000 : 15000; // 90s production, 15s dev
          break;
        case 'low':
          config.timeout = isProduction ? 120000 : 45000; // 120s production, 45s dev
          break;
        default:
          config.timeout = isProduction ? 120000 : 30000; // 120s production, 30s dev
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
    // Remove from pending requests
    if (response.config.__requestId) {
      pendingRequests.delete(response.config.__requestId);
    }
    
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
    // Remove from pending requests
    if (error.config?.__requestId) {
      pendingRequests.delete(error.config.__requestId);
    }
    
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

    // Check if it's a connection error (server not responding)
    if (!error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.code === 'ECONNREFUSED')) {
      const cacheKey = error.config?.url;
      const cachedData = cacheKey ? cache.get(cacheKey) : null;
      
      // Calculate time since first request
      const timeSinceFirstRequest = firstRequestTime ? Date.now() - firstRequestTime : 0;
      // Check if there are still pending requests
      const hasActiveFetch = pendingRequests.size > 0;
      const shouldShowMessage = timeSinceFirstRequest > 15000 && hasActiveFetch; // Only show after 15 seconds AND if still fetching

      // Show ONE message per session only, and only after 15 seconds of actual pending requests
      if (!hasShownBackendError && shouldShowMessage) {
        hasShownBackendError = true;
        
        if (cachedData) {
          // We have cache - show restart message
          if (isProduction) {
            toast.loading(
              'Backend server starting (Render hosting)...\nThis may take 1-2 minutes. Showing cached data.',
              { duration: 8000, id: 'backend-starting' }
            );
          } else {
            toast.loading(
              'Backend is not responding...\nShowing cached content.',
              { duration: 4000 }
            );
          }
        } else {
          // No cache - show waiting message
          if (isProduction) {
            toast.loading(
              'Backend server starting up (Render Free Tier)...\nPlease wait ~1-2 minutes for first load.',
              { duration: 10000, id: 'backend-starting' }
            );
          } else {
            toast.error(
              'Failed to connect to server.\nPlease check your connection.',
              { duration: 4000 }
            );
          }
        }
      }

      // Return cached data if available
      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          fromCache: true,
          config: error.config,
        });
      }
    } else if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 500) {
      const cacheKey = error.config?.url;
      const cachedData = cacheKey ? cache.get(cacheKey) : null;
      
      if (cachedData) {
        toast.loading('Server error. Showing cached content.', { duration: 3000 });
        return Promise.resolve({
          data: cachedData,
          status: 200,
          fromCache: true,
          config: error.config,
        });
      }
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      const cacheKey = error.config?.url;
      const cachedData = cacheKey ? cache.get(cacheKey) : null;
      
      if (cachedData) {
        toast.loading('Connection issue. Showing cached content.', { duration: 3000 });
        return Promise.resolve({
          data: cachedData,
          status: 200,
          fromCache: true,
          config: error.config,
        });
      }
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;