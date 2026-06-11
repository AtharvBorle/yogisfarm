class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in the cache with a specific Time-To-Live
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds - Default 300 seconds (5 minutes)
   */
  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache. Returns null if key not found or expired.
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a specific cache key
   * @param {string} key 
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Delete all cache keys starting with a specific prefix
   * @param {string} prefix 
   */
  delStartWith(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all items from the cache
   */
  flush() {
    this.cache.clear();
  }
}

const cacheInstance = new MemoryCache();
module.exports = cacheInstance;
