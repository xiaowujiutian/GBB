import { Injectable, Logger } from '@nestjs/common';

// 简单的缓存接口定义
interface CacheItem {
  value: any;
  expiresAt?: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheItem>();

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），不传则使用默认值
   */
  set(key: string, value: any, ttl?: number): void {
    try {
      const item: CacheItem = { value };
      if (ttl) {
        item.expiresAt = Date.now() + ttl * 1000;
      }
      this.cache.set(key, item);
      this.logger.debug(`Cache set: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to set cache for key: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   */
  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      if (!item) {
        this.logger.debug(`Cache miss: ${key}`);
        return null;
      }

      // 检查是否过期
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.cache.delete(key);
        this.logger.debug(`Cache expired: ${key}`);
        return null;
      }

      this.logger.debug(`Cache hit: ${key}`);
      return item.value;
    } catch (error) {
      this.logger.error(
        `Failed to get cache for key: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  del(key: string): void {
    try {
      this.cache.delete(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete cache for key: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * 清空所有缓存
   */
  reset(): void {
    try {
      this.cache.clear();
      this.logger.debug('All cache cleared');
    } catch (error) {
      this.logger.error(
        'Failed to clear all cache',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  has(key: string): boolean {
    try {
      const value = this.get(key);
      return value !== null;
    } catch (error) {
      this.logger.error(
        `Failed to check cache existence for key: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * 获取或设置缓存（如果不存在则调用 factory 函数生成值）
   * @param key 缓存键
   * @param factory 生成缓存值的函数
   * @param ttl 过期时间（秒）
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      let value = this.get<T>(key);

      if (value === null) {
        this.logger.debug(`Cache miss, generating value for: ${key}`);
        value = await factory();
        this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      this.logger.error(`Failed to get or set cache for key: ${key}`, error);
      // 如果缓存操作失败，直接调用 factory 函数
      return await factory();
    }
  }

  /**
   * 设置多个缓存
   * @param items 缓存项数组
   */
  async setMultiple(
    items: Array<{ key: string; value: any; ttl?: number }>,
  ): Promise<void> {
    try {
      const promises = items.map((item) =>
        this.set(item.key, item.value, item.ttl),
      );
      await Promise.all(promises);
      this.logger.debug(`Multiple cache set: ${items.length} items`);
    } catch (error) {
      this.logger.error('Failed to set multiple cache items', error);
      throw error;
    }
  }

  /**
   * 获取多个缓存
   * @param keys 缓存键数组
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const promises = keys.map((key) => ({
        key,
        value: this.get<T>(key) || null,
      }));

      const results = await Promise.all(promises);
      const resultMap: Record<string, T | null> = {};

      results.forEach(({ key, value }) => {
        resultMap[key] = value;
      });

      this.logger.debug(`Multiple cache get: ${keys.length} items`);
      return resultMap;
    } catch (error) {
      this.logger.error('Failed to get multiple cache items', error);
      // 返回空对象
      const emptyResult: Record<string, T | null> = {};
      keys.forEach((key) => {
        emptyResult[key] = null;
      });
      return emptyResult;
    }
  }

  /**
   * 根据模式删除缓存
   * @param pattern 匹配模式（支持通配符）
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      // 注意：这个功能需要 Redis 支持，在实际使用中可能需要调整
      this.logger.warn(`Pattern-based deletion not implemented: ${pattern}`);
      // TODO: 实现基于模式的删除功能
      // 可以通过 Redis 的 SCAN 命令配合 DEL 来实现
      await Promise.resolve();
    } catch (error) {
      this.logger.error(
        `Failed to delete cache by pattern: ${pattern}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * 生成缓存键
   * @param prefix 前缀
   * @param parts 键的组成部分
   */
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // 预定义的缓存键生成器
  getUserCacheKey(userId: string): string {
    return this.generateKey('user', userId);
  }

  getOrderCacheKey(orderNo: string): string {
    return this.generateKey('order', orderNo);
  }

  getPackageCacheKey(packageId: number): string {
    return this.generateKey('package', packageId);
  }

  getSearchCacheKey(type: string, params: string): string {
    return this.generateKey('search', type, params);
  }

  getAnalyticsCacheKey(type: string, params: string): string {
    return this.generateKey('analytics', type, params);
  }
}
