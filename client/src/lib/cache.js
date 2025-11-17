// Cache system with localStorage persistence and time limits for BoiPaben
class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('app_cache');
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Load non-expired items
        Object.entries(data).forEach(([key, item]) => {
          if (item.expiresAt > now) {
            this.cache.set(key, item.value);
            // Set timer for remaining time
            const remainingTtl = Math.floor((item.expiresAt - now) / 1000);
            this.setTimer(key, remainingTtl);
          }
        });
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
    }
  }

  saveToLocalStorage() {
    try {
      const data = {};
      const now = Date.now();
      
      this.cache.forEach((value, key) => {
        // Calculate expiration time from timer
        const timer = this.timers.get(key);
        if (timer) {
          data[key] = {
            value,
            expiresAt: now + (timer._idleTimeout || 3600000) // Default 1 hour if no timer
          };
        }
      });
      
      localStorage.setItem('app_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }

  setTimer(key, ttlSeconds) {
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
      this.saveToLocalStorage();
    }, ttlSeconds * 1000);
    
    this.timers.set(key, timer);
  }

  set(key, value, ttlSeconds = 3600) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.cache.set(key, value);

    // Set expiration timer
    this.setTimer(key, ttlSeconds);
    
    // Persist to localStorage
    this.saveToLocalStorage();
    
    return value;
  }

  get(key) {
    return this.cache.get(key) || null;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    const result = this.cache.delete(key);
    this.saveToLocalStorage();
    return result;
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
    localStorage.removeItem('app_cache');
  }

  size() {
    return this.cache.size;
  }

  // Get all keys with their expiration times
  getInfo() {
    const info = {};
    for (const key of this.cache.keys()) {
      info[key] = {
        hasValue: true,
        hasTimer: this.timers.has(key)
      };
    }
    return info;
  }
}

// Create singleton instance
const cache = new Cache();

export default cache;