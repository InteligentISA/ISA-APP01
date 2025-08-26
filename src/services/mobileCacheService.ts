import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface CacheConfig {
  maxAge?: number; // in milliseconds
  maxSize?: number; // in MB
}

class MobileCacheService {
  private cacheConfig: CacheConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours default
    maxSize: 50 // 50MB default
  };

  // Initialize cache configuration
  async initialize(config?: CacheConfig) {
    if (config) {
      this.cacheConfig = { ...this.cacheConfig, ...config };
    }
    
    // Create cache directory if it doesn't exist
    try {
      await Filesystem.mkdir({
        path: 'cache',
        directory: Directory.Data,
        recursive: true
      });
    } catch (error) {
      // Directory might already exist
      console.log('Cache directory setup:', error);
    }
  }

  // Store data in cache
  async set(key: string, data: any, expiresIn?: number): Promise<void> {
    try {
      const cacheItem: CacheItem = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined
      };

      // Store in Preferences for small data
      if (JSON.stringify(data).length < 1024 * 1024) { // Less than 1MB
        await Preferences.set({
          key: `cache_${key}`,
          value: JSON.stringify(cacheItem)
        });
      } else {
        // Store in Filesystem for large data
        await Filesystem.writeFile({
          path: `cache/${key}.json`,
          data: JSON.stringify(cacheItem),
          directory: Directory.Data
        });
      }
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // Get data from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      let cacheData: string | null = null;

      // Try Preferences first
      const prefResult = await Preferences.get({ key: `cache_${key}` });
      if (prefResult.value) {
        cacheData = prefResult.value;
      } else {
        // Try Filesystem
        try {
          const fileResult = await Filesystem.readFile({
            path: `cache/${key}.json`,
            directory: Directory.Data
          });
          cacheData = fileResult.data;
        } catch (fileError) {
          // File doesn't exist
          return null;
        }
      }

      if (!cacheData) return null;

      const cacheItem: CacheItem = JSON.parse(cacheData);
      
      // Check if expired
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data as T;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  // Remove item from cache
  async remove(key: string): Promise<void> {
    try {
      // Try to remove from Preferences
      await Preferences.remove({ key: `cache_${key}` });
      
      // Try to remove from Filesystem
      try {
        await Filesystem.deleteFile({
          path: `cache/${key}.json`,
          directory: Directory.Data
        });
      } catch (fileError) {
        // File doesn't exist, that's fine
      }
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      // Clear Preferences cache
      const keys = await Preferences.keys();
      const cacheKeys = keys.keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        await Preferences.remove({ key });
      }

      // Clear Filesystem cache
      try {
        const files = await Filesystem.readdir({
          path: 'cache',
          directory: Directory.Data
        });

        for (const file of files.files) {
          if (file.name.endsWith('.json')) {
            await Filesystem.deleteFile({
              path: `cache/${file.name}`,
              directory: Directory.Data
            });
          }
        }
      } catch (fileError) {
        // Directory might not exist
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    try {
      let size = 0;

      // Calculate Preferences cache size
      const keys = await Preferences.keys();
      const cacheKeys = keys.keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const result = await Preferences.get({ key });
        if (result.value) {
          size += new Blob([result.value]).size;
        }
      }

      // Calculate Filesystem cache size
      try {
        const files = await Filesystem.readdir({
          path: 'cache',
          directory: Directory.Data
        });

        for (const file of files.files) {
          if (file.name.endsWith('.json')) {
            const fileInfo = await Filesystem.stat({
              path: `cache/${file.name}`,
              directory: Directory.Data
            });
            size += fileInfo.size || 0;
          }
        }
      } catch (fileError) {
        // Directory might not exist
      }

      return size;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  // Get all cache keys
  async getCacheKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      
      // Get Preferences cache keys
      const prefKeys = await Preferences.keys();
      const cachePrefKeys = prefKeys.keys.filter(key => key.startsWith('cache_'));
      keys.push(...cachePrefKeys.map(key => key.replace('cache_', '')));

      // Get Filesystem cache keys
      try {
        const files = await Filesystem.readdir({
          path: 'cache',
          directory: Directory.Data
        });

        const cacheFileKeys = files.files
          .filter(file => file.name.endsWith('.json'))
          .map(file => file.name.replace('.json', ''));
        
        keys.push(...cacheFileKeys);
      } catch (fileError) {
        // Directory might not exist
      }

      return keys;
    } catch (error) {
      console.error('Error getting cache keys:', error);
      return [];
    }
  }

  // Clean expired cache
  async cleanExpired(): Promise<void> {
    try {
      const keys = await Preferences.keys();
      const cacheKeys = keys.keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const result = await Preferences.get({ key });
        if (result.value) {
          const cacheItem: CacheItem = JSON.parse(result.value);
          if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
            await Preferences.remove({ key });
          }
        }
      }

      // Clean Filesystem cache
      try {
        const files = await Filesystem.readdir({
          path: 'cache',
          directory: Directory.Data
        });

        for (const file of files.files) {
          if (file.name.endsWith('.json')) {
            const fileResult = await Filesystem.readFile({
              path: `cache/${file.name}`,
              directory: Directory.Data
            });
            
            const cacheItem: CacheItem = JSON.parse(fileResult.data);
            if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
              await Filesystem.deleteFile({
                path: `cache/${file.name}`,
                directory: Directory.Data
              });
            }
          }
        }
      } catch (fileError) {
        // Directory might not exist
      }
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }
}

export const mobileCacheService = new MobileCacheService();
