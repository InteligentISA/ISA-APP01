# Mobile Caching System

This document explains how the mobile caching system works in your ISA app, designed to provide offline functionality and faster performance when users download the app from the Play Store or App Store.

## Overview

The mobile caching system provides:
- **Offline data access** - Users can browse cached products even without internet
- **Faster loading** - Cached data loads instantly from local storage
- **Reduced data usage** - Less network requests for frequently accessed data
- **Better user experience** - Smooth browsing even with slow connections

## Architecture

### Core Components

1. **MobileCacheService** (`src/services/mobileCacheService.ts`)
   - Handles all cache operations (get, set, remove, clear)
   - Uses Capacitor Preferences for small data (< 1MB)
   - Uses Capacitor Filesystem for large data (≥ 1MB)
   - Automatic expiration and cleanup

2. **CachedProductService** (`src/services/cachedProductService.ts`)
   - Wraps ProductService with caching layer
   - Implements cache-first strategy
   - Handles product-specific cache keys and durations

3. **useMobileCache Hook** (`src/hooks/useMobileCache.ts`)
   - React hook for easy cache integration
   - Provides loading states and error handling
   - Supports auto-refresh and manual operations

4. **CacheManagement Component** (`src/components/CacheManagement.tsx`)
   - UI for users to manage their cache
   - Shows cache size and usage
   - Provides cache clearing and preloading options

## Cache Strategy

### Cache Durations
- **Product Data**: 30 minutes
- **Featured Products**: 15 minutes
- **Categories**: 1 hour
- **Product Details**: 1 hour
- **Search Results**: 10 minutes
- **Dashboard Products**: 30 minutes

### Storage Strategy
- **Small data** (< 1MB): Stored in Capacitor Preferences
- **Large data** (≥ 1MB): Stored in Capacitor Filesystem
- **Maximum cache size**: 50MB (configurable)
- **Automatic cleanup**: Expired data is automatically removed

## Usage Examples

### Basic Cache Usage

```typescript
import { useMobileCache } from '@/hooks/useMobileCache';

function MyComponent() {
  const {
    data,
    loading,
    error,
    saveToCache,
    removeFromCache
  } = useMobileCache({
    key: 'my_cache_key',
    expiresIn: 60 * 60 * 1000 // 1 hour
  });

  // Save data to cache
  const handleSave = () => {
    saveToCache({ some: 'data' });
  };

  // Remove from cache
  const handleClear = () => {
    removeFromCache();
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Using Cached Services

```typescript
import { CachedProductService } from '@/services/cachedProductService';

// Get products with automatic caching
const { data, error } = await CachedProductService.getProducts();

// Get featured products
const { data: featured } = await CachedProductService.getFeaturedProducts(8);

// Search products
const { data: searchResults } = await CachedProductService.searchProducts('laptop');
```

### Cache Management

```typescript
import { useMobileCacheManager } from '@/hooks/useMobileCache';

function CacheManager() {
  const {
    cacheSize,
    clearAllCache,
    cleanExpiredCache,
    preloadData
  } = useMobileCacheManager();

  return (
    <div>
      <p>Cache size: {cacheSize} bytes</p>
      <button onClick={clearAllCache}>Clear All Cache</button>
      <button onClick={cleanExpiredCache}>Clean Expired</button>
      <button onClick={preloadData}>Preload Data</button>
    </div>
  );
}
```

## Integration Points

### App Initialization
The cache service is automatically initialized in `App.tsx`:

```typescript
useEffect(() => {
  const initializeCache = async () => {
    await mobileCacheService.initialize({
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 50 * 1024 * 1024 // 50MB
    });
  };
  
  initializeCache();
}, []);
```

### Dashboard Integration
The main Dashboard component uses cached products:

```typescript
// In Dashboard.tsx
CachedProductService.getDashboardProducts(currentPage, PRODUCTS_PER_PAGE, searchQuery, category)
```

### Settings Integration
Users can manage cache through the Settings modal:

```typescript
// Cache management tab in Settings
<TabsContent value="cache">
  <CacheManagement />
</TabsContent>
```

## Offline Functionality

### Preloading Essential Data
The app can preload essential data for offline use:

```typescript
// Preload categories, featured products, and main category products
await CachedProductService.preloadEssentialData();
```

### Offline Detection
You can detect offline status and show appropriate UI:

```typescript
import { Network } from '@capacitor/network';

const checkOnlineStatus = async () => {
  const status = await Network.getStatus();
  return status.connected;
};
```

## Performance Benefits

### Loading Times
- **First load**: Normal API call + cache storage
- **Subsequent loads**: Instant from cache
- **Offline browsing**: Instant from cache

### Data Usage
- **Reduced API calls**: Cached data doesn't require network requests
- **Smart refresh**: Only fetches new data when cache expires
- **Efficient storage**: Automatic cleanup prevents storage bloat

## Best Practices

### Cache Keys
- Use descriptive, unique keys
- Include parameters in keys for filtered data
- Example: `products_category_electronics_20`

### Cache Duration
- Short duration for frequently changing data
- Longer duration for static data
- Consider user behavior patterns

### Error Handling
- Always handle cache misses gracefully
- Fall back to API calls when cache fails
- Show appropriate loading states

### Storage Management
- Monitor cache size regularly
- Implement automatic cleanup
- Provide user controls for cache management

## Troubleshooting

### Common Issues

1. **Cache not working**
   - Check if Capacitor plugins are properly installed
   - Verify cache service initialization
   - Check console for error messages

2. **Cache size too large**
   - Implement automatic cleanup
   - Reduce cache durations
   - Clear cache manually

3. **Stale data**
   - Check cache expiration settings
   - Implement cache invalidation
   - Force refresh when needed

### Debug Commands

```typescript
// Check cache size
const size = await mobileCacheService.getCacheSize();
console.log('Cache size:', size);

// List all cache keys
const keys = await mobileCacheService.getCacheKeys();
console.log('Cache keys:', keys);

// Clear all cache
await mobileCacheService.clear();
```

## Future Enhancements

### Planned Features
- **Background sync**: Sync data when app is in background
- **Selective sync**: Sync only changed data
- **Cache analytics**: Track cache hit rates and performance
- **Advanced expiration**: Time-based and event-based expiration
- **Compression**: Compress cached data to save space

### Integration Opportunities
- **Push notifications**: Update cache when new data is available
- **User preferences**: Cache user settings and preferences
- **Search history**: Cache recent searches for quick access
- **Product recommendations**: Cache personalized recommendations

## Conclusion

The mobile caching system provides a robust foundation for offline functionality and improved performance. By implementing cache-first strategies and providing user controls, the app delivers a smooth experience even with limited connectivity.

For questions or issues, refer to the Capacitor documentation or check the console for detailed error messages.
