import React from 'react';
import { useMobileCache } from '../hooks/useMobileCache';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RefreshCw, Download, Trash2 } from 'lucide-react';

// Example component showing how to use the mobile cache
export function CacheExample() {
  // Example: Cache user preferences
  const {
    data: userPreferences,
    loading: preferencesLoading,
    error: preferencesError,
    lastUpdated: preferencesLastUpdated,
    saveToCache: savePreferences,
    removeFromCache: removePreferences,
    refresh: refreshPreferences
  } = useMobileCache({
    key: 'user_preferences',
    expiresIn: 24 * 60 * 60 * 1000, // 24 hours
    autoRefresh: false
  });

  // Example: Cache recent searches
  const {
    data: recentSearches,
    loading: searchesLoading,
    saveToCache: saveSearches,
    removeFromCache: removeSearches
  } = useMobileCache({
    key: 'recent_searches',
    expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  });

  const handleSavePreferences = () => {
    const newPreferences = {
      theme: 'dark',
      language: 'en',
      notifications: true,
      autoPlay: false
    };
    savePreferences(newPreferences);
  };

  const handleSaveSearch = () => {
    const newSearches = [
      'smartphone',
      'laptop',
      'headphones',
      'smartwatch'
    ];
    saveSearches(newSearches);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Preferences Cache</CardTitle>
          <CardDescription>
            Example of caching user preferences with 24-hour expiration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">
                {preferencesLoading ? 'Loading...' : preferencesError ? 'Error' : 'Ready'}
              </p>
            </div>
            {preferencesLastUpdated && (
              <Badge variant="outline">
                Updated: {preferencesLastUpdated.toLocaleTimeString()}
              </Badge>
            )}
          </div>

          {userPreferences && (
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(userPreferences, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSavePreferences} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
            <Button onClick={refreshPreferences} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={removePreferences} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Searches Cache</CardTitle>
          <CardDescription>
            Example of caching recent searches with auto-refresh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">
                {searchesLoading ? 'Loading...' : 'Ready'}
              </p>
            </div>
            <Badge variant="secondary">Auto-refresh enabled</Badge>
          </div>

          {recentSearches && Array.isArray(recentSearches) && (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search: string, index: number) => (
                <Badge key={index} variant="outline">
                  {search}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSaveSearch} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Save Searches
            </Button>
            <Button onClick={removeSearches} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
