import Dexie, { Table } from 'dexie';

/**
 * Cache entry structure for all cached queries
 */
export interface CacheEntry<T = any> {
  key: string; // Unique cache key (e.g., 'exercises:all' or 'exercise:123')
  data: T; // Cached data
  timestamp: number; // When cache was last updated (ms)
  expiresAt?: number; // Optional expiration timestamp (ms)
}

/**
 * Training Platform Database with IndexedDB via Dexie
 *
 * Version history:
 * v1: Initial cache table structure
 */
export class TrainingPlatformDB extends Dexie {
  cache!: Table<CacheEntry, string>;

  constructor() {
    super('TrainingPlatformDB');

    // Schema version 1
    this.version(1).stores({
      cache: 'key, timestamp', // Primary key: key, indexed: timestamp
    });
  }

  /**
   * Get cached data by key
   */
  async getCache<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const entry = await this.cache.get(key);

    // Check if cache is expired
    if (entry && entry.expiresAt && Date.now() > entry.expiresAt) {
      await this.cache.delete(key);
      return undefined;
    }

    return entry as CacheEntry<T> | undefined;
  }

  /**
   * Set cached data with optional TTL
   */
  async setCache<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    const timestamp = Date.now();
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp,
      expiresAt: ttlMs ? timestamp + ttlMs : undefined,
    };

    await this.cache.put(entry);
  }

  /**
   * Delete cache by key
   */
  async deleteCache(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  /**
   * Delete all cache entries matching a pattern
   */
  async deleteCachePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keys = await this.cache.filter((entry) => regex.test(entry.key)).primaryKeys();

    await this.cache.bulkDelete(keys);
  }

  /**
   * Clear all expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    const expiredKeys = await this.cache
      .filter((entry) => entry.expiresAt !== undefined && entry.expiresAt < now)
      .primaryKeys();

    await this.cache.bulkDelete(expiredKeys);
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const totalEntries = await this.cache.count();
    const now = Date.now();

    const entries = await this.cache.toArray();
    const expiredCount = entries.filter(
      (e) => e.expiresAt !== undefined && e.expiresAt < now,
    ).length;

    const oldestEntry = entries.reduce(
      (oldest, entry) => (!oldest || entry.timestamp < oldest.timestamp ? entry : oldest),
      null as CacheEntry | null,
    );

    const newestEntry = entries.reduce(
      (newest, entry) => (!newest || entry.timestamp > newest.timestamp ? entry : newest),
      null as CacheEntry | null,
    );

    return {
      totalEntries,
      expiredCount,
      oldestTimestamp: oldestEntry?.timestamp,
      newestTimestamp: newestEntry?.timestamp,
    };
  }
}

// Singleton instance
export const db = new TrainingPlatformDB();

// Auto-cleanup expired cache on app start
db.clearExpiredCache().catch(console.error);
