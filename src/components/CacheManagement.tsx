import React from 'react';
import { useMobileCacheManager } from '../hooks/useMobileCache';
import { CachedProductService } from '../services/cachedProductService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Trash2, RefreshCw, Download, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

export function CacheManagement() {
  const {
    cacheSize,
    isClearing,
    getCacheSize,
    clearAllCache,
    cleanExpiredCache,
    initializeCache,
  } = useMobileCacheManager();

  const [isPreloading, setIsPreloading] = React.useState(false);
  const [isCleaning, setIsCleaning] = React.useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearAllCache = async () => {
    try {
      await clearAllCache();
      toast.success('All cache cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const handleCleanExpiredCache = async () => {
    try {
      setIsCleaning(true);
      await cleanExpiredCache();
      toast.success('Expired cache cleaned successfully');
    } catch (error) {
      toast.error('Failed to clean expired cache');
    } finally {
      setIsCleaning(false);
    }
  };

  const handlePreloadData = async () => {
    try {
      setIsPreloading(true);
      await CachedProductService.preloadEssentialData();
      await getCacheSize(); // Refresh cache size
      toast.success('Essential data preloaded for offline use');
    } catch (error) {
      toast.error('Failed to preload data');
    } finally {
      setIsPreloading(false);
    }
  };

  const handleRefreshCacheSize = async () => {
    try {
      await getCacheSize();
      toast.success('Cache size updated');
    } catch (error) {
      toast.error('Failed to refresh cache size');
    }
  };

  // Calculate cache usage percentage (assuming 50MB max)
  const maxCacheSize = 50 * 1024 * 1024; // 50MB in bytes
  const cacheUsagePercentage = (cacheSize / maxCacheSize) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cache Storage
          </CardTitle>
          <CardDescription>
            Manage your app's local storage and cached data for offline use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cache Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(cacheSize)} / {formatBytes(maxCacheSize)}
              </span>
            </div>
            <Progress value={cacheUsagePercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Cache Status */}
          <div className="flex items-center gap-2">
            <Badge variant={cacheSize > maxCacheSize * 0.8 ? "destructive" : "secondary"}>
              {cacheSize > maxCacheSize * 0.8 ? "High Usage" : "Normal"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {cacheUsagePercentage.toFixed(1)}% of storage used
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cache Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>
            Control how your app stores data locally
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preload Data */}
            <Button
              onClick={handlePreloadData}
              disabled={isPreloading}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Download className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Preload Data</div>
                <div className="text-xs text-muted-foreground">
                  Download essential data for offline use
                </div>
              </div>
            </Button>

            {/* Clean Expired */}
            <Button
              onClick={handleCleanExpiredCache}
              disabled={isCleaning}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <RefreshCw className={`h-5 w-5 ${isCleaning ? 'animate-spin' : ''}`} />
              <div className="text-center">
                <div className="font-medium">Clean Expired</div>
                <div className="text-xs text-muted-foreground">
                  Remove outdated cached data
                </div>
              </div>
            </Button>

            {/* Refresh Size */}
            <Button
              onClick={handleRefreshCacheSize}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Refresh Size</div>
                <div className="text-xs text-muted-foreground">
                  Update cache size information
                </div>
              </div>
            </Button>

            {/* Clear All */}
            <Button
              onClick={handleClearAllCache}
              disabled={isClearing}
              variant="destructive"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Clear All Cache</div>
                <div className="text-xs text-muted-foreground">
                  Remove all cached data
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Information</CardTitle>
          <CardDescription>
            Learn about how caching works in your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Product Data</span>
              <Badge variant="outline">30 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Featured Products</span>
              <Badge variant="outline">15 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Categories</span>
              <Badge variant="outline">1 hour</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Search Results</span>
              <Badge variant="outline">10 min</Badge>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              • Cached data helps the app work faster and offline
            </p>
            <p>
              • Data automatically expires to keep information fresh
            </p>
            <p>
              • You can manually clear cache to free up storage space
            </p>
            <p>
              • Preloading data ensures you can browse products offline
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
