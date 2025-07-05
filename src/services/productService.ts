import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFilters, ProductSortOption, ProductSearchParams } from '@/types/product';
import { ImageUploadService } from './imageUploadService';
import { scrapeJumiaProducts } from './jumiaScraperService';
import { DashboardProduct, DashboardVendorProduct, DashboardJumiaProduct } from '@/types/product';

export class ProductService {
  // Get all products with optional filters
  static async getProducts(params: ProductSearchParams = {}): Promise<{ data: Product[]; count: number; error: any }> {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.filters) {
        if (params.filters.category) {
          query = query.eq('category', params.filters.category);
        }
        if (params.filters.minPrice !== undefined) {
          query = query.gte('price', params.filters.minPrice);
        }
        if (params.filters.maxPrice !== undefined) {
          query = query.lte('price', params.filters.maxPrice);
        }
        if (params.filters.inStock) {
          query = query.gt('stock_quantity', 0);
        }
      }

      // Apply search query
      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      // Apply sorting
      if (params.sort) {
        query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.page && params.limit) {
        const offset = (params.page - 1) * params.limit;
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, count, error } = await query;

      return { data: data || [], count: count || 0, error };
    } catch (error) {
      return { data: [], count: 0, error };
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 8): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string, limit: number = 20): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get unique categories
  static async getCategories(): Promise<{ data: string[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const categories = [...new Set(data?.map(item => item.category) || [])];
      return { data: categories, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Search products
  static async searchProducts(query: string, limit: number = 20): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Create a new product (for vendors)
  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update a product (for vendors)
  static async updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete a product (for vendors)
  static async deleteProduct(id: string): Promise<{ error: any }> {
    try {
      // First, get the product to find its images
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('main_image, images')
        .eq('id', id)
        .single();

      if (fetchError) {
        return { error: fetchError };
      }

      // Delete images from storage
      if (product) {
        const imagesToDelete = [
          ...(product.images || []),
          ...(product.main_image ? [product.main_image] : [])
        ].filter(Boolean);

        for (const imageUrl of imagesToDelete) {
          // Extract file path from URL
          const urlParts = imageUrl.split('/');
          const filePath = urlParts.slice(-2).join('/'); // Get last two parts as path
          
          if (filePath) {
            await ImageUploadService.deleteImage(filePath);
          }
        }
      }

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Upload product images
  static async uploadProductImages(files: File[], vendorId: string): Promise<{ data: string[]; error: any }> {
    try {
      const uploadPromises = files.map(file => 
        ImageUploadService.uploadImage(file, `vendors/${vendorId}`)
      );
      
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results
        .filter(result => !result.error)
        .map(result => result.url);

      const errors = results
        .filter(result => result.error)
        .map(result => result.error);

      if (errors.length > 0) {
        return { 
          data: successfulUploads, 
          error: `Some uploads failed: ${errors.join(', ')}` 
        };
      }

      return { data: successfulUploads, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Delete product image
  static async deleteProductImage(imageUrl: string): Promise<{ error: any }> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get last two parts as path
      
      if (!filePath) {
        return { error: 'Invalid image URL' };
      }

      const result = await ImageUploadService.deleteImage(filePath);
      return result;
    } catch (error) {
      return { error };
    }
  }

  // Get products by vendor
  static async getProductsByVendor(vendorId: string): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get dashboard products: vendor + Jumia fallback
  static async getDashboardProducts(page: number = 1, limit: number = 20): Promise<{ data: DashboardProduct[]; error: any; totalVendorCount: number }> {
    try {
      // Get total vendor product count (without pagination)
      const { count: totalVendorCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (countError) return { data: [], error: countError, totalVendorCount: 0 };
      
      const vendorPages = Math.ceil((totalVendorCount || 0) / limit);

      if (page <= vendorPages) {
        // Vendor products page
        const { data: vendorProducts, error } = await ProductService.getProducts({ 
          limit, 
          page,
          filters: { inStock: true } // Only show active products
        });
        
        if (error) return { data: [], error, totalVendorCount: totalVendorCount || 0 };
        
        const dashboardProducts: DashboardProduct[] = (vendorProducts || []).map((p) => ({ 
          ...p, 
          source: 'vendor' as const 
        }));
        
        return { data: dashboardProducts, error: null, totalVendorCount: totalVendorCount || 0 };
      } else {
        // Jumia products page - fallback when vendor products are insufficient
        const jumiaPage = page - vendorPages;
        const jumiaRaw = await scrapeJumiaProducts('electronics', jumiaPage);
        const jumiaProducts: DashboardJumiaProduct[] = (jumiaRaw || []).slice(0, limit).map((jp, idx) => ({
          id: `jumia-${page}-${idx}-${jp.link}`,
          name: jp.name,
          price: Number(jp.price.replace(/[^\d]/g, '')),
          rating: jp.rating === 'No rating' ? 0 : Number(jp.rating),
          link: jp.link,
          image: jp.image,
          source: 'jumia' as const,
        }));
        
        return { data: jumiaProducts, error: null, totalVendorCount: totalVendorCount || 0 };
      }
    } catch (err) {
      return { data: [], error: err, totalVendorCount: 0 };
    }
  }
} 