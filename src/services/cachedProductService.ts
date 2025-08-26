import { ProductService } from './productService';
import { mobileCacheService } from './mobileCacheService';
import { Product, ProductFilters, ProductSortOption, ProductSearchParams } from '@/types/product';

export class CachedProductService {
  private static readonly CACHE_KEYS = {
    PRODUCTS: 'products',
    FEATURED_PRODUCTS: 'featured_products',
    CATEGORIES: 'categories',
    PRODUCT_BY_ID: 'product_',
    PRODUCTS_BY_CATEGORY: 'products_category_',
    SEARCH_RESULTS: 'search_',
  };

  private static readonly CACHE_DURATIONS = {
    PRODUCTS: 30 * 60 * 1000, // 30 minutes
    FEATURED_PRODUCTS: 15 * 60 * 1000, // 15 minutes
    CATEGORIES: 60 * 60 * 1000, // 1 hour
    PRODUCT_BY_ID: 60 * 60 * 1000, // 1 hour
    PRODUCTS_BY_CATEGORY: 30 * 60 * 1000, // 30 minutes
    SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
  };

  // Get all products with caching
  static async getProducts(params: ProductSearchParams = {}): Promise<{ data: Product[]; count: number; error: any }> {
    try {
      // Create a unique cache key based on parameters
      const cacheKey = `${this.CACHE_KEYS.PRODUCTS}_${JSON.stringify(params)}`;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<{ data: Product[]; count: number }>(cacheKey);
      
      if (cachedData) {
        console.log('Products loaded from cache');
        return { ...cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log('Fetching products from API');
      const result = await ProductService.getProducts(params);
      
      if (!result.error && result.data.length > 0) {
        // Cache the result
        await mobileCacheService.set(cacheKey, {
          data: result.data,
          count: result.count
        }, this.CACHE_DURATIONS.PRODUCTS);
      }

      return result;
    } catch (error) {
      console.error('Error in cached getProducts:', error);
      return { data: [], count: 0, error };
    }
  }

  // Get featured products with caching
  static async getFeaturedProducts(limit: number = 8): Promise<{ data: Product[]; error: any }> {
    try {
      const cacheKey = `${this.CACHE_KEYS.FEATURED_PRODUCTS}_${limit}`;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<Product[]>(cacheKey);
      
      if (cachedData) {
        console.log('Featured products loaded from cache');
        return { data: cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log('Fetching featured products from API');
      const result = await ProductService.getFeaturedProducts(limit);
      
      if (!result.error && result.data.length > 0) {
        // Cache the result
        await mobileCacheService.set(cacheKey, result.data, this.CACHE_DURATIONS.FEATURED_PRODUCTS);
      }

      return result;
    } catch (error) {
      console.error('Error in cached getFeaturedProducts:', error);
      return { data: [], error };
    }
  }

  // Get products by category with caching
  static async getProductsByCategory(category: string, limit: number = 20): Promise<{ data: Product[]; error: any }> {
    try {
      const cacheKey = `${this.CACHE_KEYS.PRODUCTS_BY_CATEGORY}${category}_${limit}`;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<Product[]>(cacheKey);
      
      if (cachedData) {
        console.log(`Products for category ${category} loaded from cache`);
        return { data: cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log(`Fetching products for category ${category} from API`);
      const result = await ProductService.getProductsByCategory(category, limit);
      
      if (!result.error && result.data.length > 0) {
        // Cache the result
        await mobileCacheService.set(cacheKey, result.data, this.CACHE_DURATIONS.PRODUCTS_BY_CATEGORY);
      }

      return result;
    } catch (error) {
      console.error('Error in cached getProductsByCategory:', error);
      return { data: [], error };
    }
  }

  // Get categories with caching
  static async getCategories(): Promise<{ data: string[]; error: any }> {
    try {
      const cacheKey = this.CACHE_KEYS.CATEGORIES;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<string[]>(cacheKey);
      
      if (cachedData) {
        console.log('Categories loaded from cache');
        return { data: cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log('Fetching categories from API');
      const result = await ProductService.getCategories();
      
      if (!result.error && result.data.length > 0) {
        // Cache the result
        await mobileCacheService.set(cacheKey, result.data, this.CACHE_DURATIONS.CATEGORIES);
      }

      return result;
    } catch (error) {
      console.error('Error in cached getCategories:', error);
      return { data: [], error };
    }
  }

  // Search products with caching
  static async searchProducts(query: string, limit: number = 20): Promise<{ data: Product[]; error: any }> {
    try {
      const cacheKey = `${this.CACHE_KEYS.SEARCH_RESULTS}${query}_${limit}`;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<Product[]>(cacheKey);
      
      if (cachedData) {
        console.log(`Search results for "${query}" loaded from cache`);
        return { data: cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log(`Searching for "${query}" from API`);
      const result = await ProductService.searchProducts(query, limit);
      
      if (!result.error && result.data.length > 0) {
        // Cache the result
        await mobileCacheService.set(cacheKey, result.data, this.CACHE_DURATIONS.SEARCH_RESULTS);
      }

      return result;
    } catch (error) {
      console.error('Error in cached searchProducts:', error);
      return { data: [], error };
    }
  }

  // Get product by ID with caching
  static async getProductById(id: string): Promise<{ data: Product | null; error: any }> {
    try {
      const cacheKey = `${this.CACHE_KEYS.PRODUCT_BY_ID}${id}`;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<Product>(cacheKey);
      
      if (cachedData) {
        console.log(`Product ${id} loaded from cache`);
        return { data: cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log(`Fetching product ${id} from API`);
      const result = await ProductService.getProductById(id);
      
      if (!result.error && result.data) {
        // Cache the result
        await mobileCacheService.set(cacheKey, result.data, this.CACHE_DURATIONS.PRODUCT_BY_ID);
      }

      return result;
    } catch (error) {
      console.error('Error in cached getProductById:', error);
      return { data: null, error };
    }
  }

  // Clear specific cache entries
  static async clearProductCache(productId?: string): Promise<void> {
    try {
      if (productId) {
        // Clear specific product cache
        await mobileCacheService.remove(`${this.CACHE_KEYS.PRODUCT_BY_ID}${productId}`);
      } else {
        // Clear all product-related cache
        const keys = await mobileCacheService.getCacheKeys();
        const productKeys = keys.filter(key => 
          key.startsWith(this.CACHE_KEYS.PRODUCTS) ||
          key.startsWith(this.CACHE_KEYS.FEATURED_PRODUCTS) ||
          key.startsWith(this.CACHE_KEYS.PRODUCT_BY_ID) ||
          key.startsWith(this.CACHE_KEYS.PRODUCTS_BY_CATEGORY) ||
          key.startsWith(this.CACHE_KEYS.SEARCH_RESULTS)
        );
        
        for (const key of productKeys) {
          await mobileCacheService.remove(key);
        }
      }
    } catch (error) {
      console.error('Error clearing product cache:', error);
    }
  }

  // Get dashboard products with caching
  static async getDashboardProducts(page: number = 1, limit: number = 20, searchQuery?: string, category?: string): Promise<{ data: any[]; error: any; totalVendorCount: number }> {
    try {
      // Create a unique cache key based on parameters
      const cacheKey = `dashboard_products_${page}_${limit}_${searchQuery || 'noquery'}_${category || 'all'}`;
      
      // Try to get from cache first
      const cachedData = await mobileCacheService.get<{ data: any[]; totalVendorCount: number }>(cacheKey);
      
      if (cachedData) {
        console.log('Dashboard products loaded from cache');
        return { ...cachedData, error: null };
      }

      // If not in cache, fetch from API
      console.log('Fetching dashboard products from API');
      const result = await ProductService.getDashboardProducts(page, limit, searchQuery, category);
      
      if (!result.error && result.data.length > 0) {
        // Cache the result
        await mobileCacheService.set(cacheKey, {
          data: result.data,
          totalVendorCount: result.totalVendorCount
        }, this.CACHE_DURATIONS.PRODUCTS);
      }

      return result;
    } catch (error) {
      console.error('Error in cached getDashboardProducts:', error);
      return { data: [], error, totalVendorCount: 0 };
    }
  }

  // Preload essential data for offline use
  static async preloadEssentialData(): Promise<void> {
    try {
      console.log('Preloading essential product data for offline use...');
      
      // Preload categories
      await this.getCategories();
      
      // Preload featured products
      await this.getFeaturedProducts(12);
      
      // Preload some products from main categories
      const categories = await this.getCategories();
      if (categories.data.length > 0) {
        const mainCategories = categories.data.slice(0, 3); // First 3 categories
        for (const category of mainCategories) {
          await this.getProductsByCategory(category, 8);
        }
      }
      
      // Preload first page of dashboard products
      await this.getDashboardProducts(1, 20);
      
      console.log('Essential product data preloaded successfully');
    } catch (error) {
      console.error('Error preloading essential data:', error);
    }
  }
}
