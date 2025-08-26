import { useState, useEffect, useCallback } from 'react';
import { mobileCacheService, CacheConfig } from '../services/mobileCacheService';

export interface UseMobileCacheOptions {
  key: string;
  expiresIn?: number; // in milliseconds
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useMobileCache<T>(
  options: UseMobileCacheOptions
) {
  const { key, expiresIn, autoRefresh = false, refreshInterval = 5 * 60 * 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load data from cache
  const loadFromCache = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cachedData = await mobileCacheService.get<T>(key);
      
      if (cachedData) {
        setData(cachedData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load from cache'));
    } finally {
      setLoading(false);
    }
  }, [key]);

  // Save data to cache
  const saveToCache = useCallback(async (newData: T) => {
    try {
      await mobileCacheService.set(key, newData, expiresIn);
      setData(newData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save to cache'));
    }
  }, [key, expiresIn]);

  // Remove from cache
  const removeFromCache = useCallback(async () => {
    try {
      await mobileCacheService.remove(key);
      setData(null);
      setLastUpdated(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove from cache'));
    }
  }, [key]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && data) {
      const interval = setInterval(() => {
        loadFromCache();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, data, refreshInterval, loadFromCache]);

  // Initial load
  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    saveToCache,
    removeFromCache,
    refresh: loadFromCache,
  };
}

// Hook for managing multiple cache items
export function useMobileCacheManager() {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState(false);

  const getCacheSize = useCallback(async () => {
    try {
      const size = await mobileCacheService.getCacheSize();
      setCacheSize(size);
      return size;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }, []);

  const clearAllCache = useCallback(async () => {
    try {
      setIsClearing(true);
      await mobileCacheService.clear();
      setCacheSize(0);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    } finally {
      setIsClearing(false);
    }
  }, []);

  const cleanExpiredCache = useCallback(async () => {
    try {
      await mobileCacheService.cleanExpired();
      await getCacheSize(); // Refresh size after cleaning
    } catch (error) {
      console.error('Failed to clean expired cache:', error);
      throw error;
    }
  }, [getCacheSize]);

  const initializeCache = useCallback(async (config?: CacheConfig) => {
    try {
      await mobileCacheService.initialize(config);
      await getCacheSize();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
      throw error;
    }
  }, [getCacheSize]);

  // Load cache size on mount
  useEffect(() => {
    getCacheSize();
  }, [getCacheSize]);

  return {
    cacheSize,
    isClearing,
    getCacheSize,
    clearAllCache,
    cleanExpiredCache,
    initializeCache,
  };
}
