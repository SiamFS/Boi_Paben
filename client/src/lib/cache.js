/**
 * Minimal Cache System - Only for non-API data (e.g., form inputs)
 * 
 * IMPORTANT: Use TanStack Query for API responses, NOT this cache!
 * This cache is ONLY for user preferences, form data, and temporary UI state.
 * 
 * API caching should be handled by:
 * - TanStack Query (React Query) with staleTime and cacheTime
 * - HTTP headers (Cache-Control, ETag)
 * - Backend response caching
 */

class MinimalCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Store a value in memory
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @returns {*} The stored value
   */
  set(key, value) {
    this.store.set(key, value);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✓ Cached: ${key}`);
    }
    return value;
  }

  /**
   * Retrieve a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    return this.store.get(key) || null;
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * Delete a specific key
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  delete(key) {
    const result = this.store.delete(key);
    if (result && process.env.NODE_ENV !== 'production') {
      console.log(`✓ Deleted cache: ${key}`);
    }
    return result;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Cache cleared');
    }
  }

  /**
   * Get current cache size
   * @returns {number}
   */
  size() {
    return this.store.size;
  }
}

// Create singleton instance
const cache = new MinimalCache();

export default cache;