// Cache system with time limits for BoiPaben
class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttlSeconds = 3600) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.cache.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
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
    return this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
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