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

// Track if we've shown backend error message in this session (show only once)
let hasShownBackendError = false;
let firstRequestTime = null;
let pendingRequests = new Set();
let serverCheckTimeout = null;
const isProduction = !isLocalhost && !isDevelopment;

// Cache configuration: which endpoints to cache and for how long (in seconds)
const CACHE_CONFIG = {
  // Removed '/api/books/all' from cache to prevent sorting/filtering issues
  '/api/books/latest': 120, // 2 minutes - fresher data
  '/api/books/category': 120, // 2 minutes - fresher data
  // Removed '/api/books/user' from cache for dashboard real-time updates
  '/api/blog/posts': 120, // 2 minutes - fresher data
  '/api/blog/reactions': 120, // 2 minutes - fresher data
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
    
    // Track first request time and set up server check timeout
    if (!firstRequestTime) {
      firstRequestTime = Date.now();
      
      // Show message after 5 seconds if server hasn't responded
      if (!serverCheckTimeout && isProduction) {
        serverCheckTimeout = setTimeout(() => {
          if (pendingRequests.size > 0 && !hasShownBackendError) {
            hasShownBackendError = true;
            toast.loading(
              'Unable to connect to server. Please wait 30-60 seconds while the server wakes up. The server is hosted on Render.com (Free Tier) and automatically shuts down after 15 minutes of inactivity.',
              { duration: 30000, id: 'server-starting' }
            );
          }
        }, 5000); // Show after 5 seconds
      }
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
    
    // Check cache for GET requests (skip if cache: false)
    if (config.method === 'get' && config.cache !== false) {
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
    
    // Clear server check timeout if server responded successfully
    if (serverCheckTimeout && pendingRequests.size === 0) {
      clearTimeout(serverCheckTimeout);
      serverCheckTimeout = null;
      // Dismiss the "server starting" message if shown
      toast.dismiss('server-starting');
    }
    
    // Cache successful GET responses (skip if cache: false)
    if (response.config.method === 'get' && response.config.cache !== false) {
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