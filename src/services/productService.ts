import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFilters, ProductSortOption, ProductSearchParams, ProductAttribute, ProductImage } from '@/types/product';
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
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%,brand.ilike.%${params.query}%`);
      }

      // Apply sorting
      if (params.sort) {
        if (params.sort.field === 'random') {
          // For random ordering, we'll sort in JavaScript after fetching
          query = query.order('id', { ascending: true }); // Use consistent ordering for pagination
        } else {
          query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
        }
      } else {
        // Default to random ordering - we'll shuffle in JavaScript
        query = query.order('id', { ascending: true }); // Use consistent ordering for pagination
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

      if (error) {
        return { data: [], count: 0, error };
      }

      let resultData = data || [];
      
      // Apply random shuffling if random ordering is requested or default
      if (!params.sort || params.sort.field === 'random') {
        // Fisher-Yates shuffle algorithm
        for (let i = resultData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [resultData[i], resultData[j]] = [resultData[j], resultData[i]];
        }
      }

      return { data: resultData, count: count || 0, error: null };
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
        .order('id', { ascending: true })
        .limit(limit * 2); // Fetch more to ensure we have enough after shuffling

      if (error) {
        return { data: [], error };
      }

      let resultData = data || [];
      
      // Shuffle the results
      for (let i = resultData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultData[i], resultData[j]] = [resultData[j], resultData[i]];
      }

      // Return only the requested limit
      return { data: resultData.slice(0, limit), error: null };
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
        .order('id', { ascending: true })
        .limit(limit * 2); // Fetch more to ensure we have enough after shuffling

      if (error) {
        return { data: [], error };
      }

      let resultData = data || [];
      
      // Shuffle the results
      for (let i = resultData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultData[i], resultData[j]] = [resultData[j], resultData[i]];
      }

      // Return only the requested limit
      return { data: resultData.slice(0, limit), error: null };
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
      console.log('Creating product with data:', product);
      
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select('*')
        .single();

      if (error) {
        console.error('Product creation error:', error);
        return { data: null, error };
      }

      console.log('Product created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Product creation exception:', error);
      return { data: null, error };
    }
  }

  // Update a product (for vendors)
  static async updateProduct(id: string, updates: Partial<Product>, userId: string): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('vendor_id', userId)
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
        .order('id', { ascending: true });

      if (error) {
        return { data: [], error };
      }

      let resultData = data || [];
      
      // Shuffle the results
      for (let i = resultData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultData[i], resultData[j]] = [resultData[j], resultData[i]];
      }

      return { data: resultData, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get dashboard products: vendor + Jumia fallback
  static async getDashboardProducts(page: number = 1, limit: number = 20, searchQuery?: string, category?: string): Promise<{ data: DashboardProduct[]; error: any; totalVendorCount: number }> {
    try {
      // Build query for vendor products with filters
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply category filter
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      // Apply search filter
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%`);
      }

      // Get total count with filters
      const { count: totalVendorCount, error: countError } = await query;
      
      if (countError) return { data: [], error: countError, totalVendorCount: 0 };
      
      const vendorPages = Math.ceil((totalVendorCount || 0) / limit);

      if (page <= vendorPages) {
        // Vendor products page with filters
        const { data: vendorProducts, error } = await ProductService.getProducts({ 
          limit, 
          page,
          query: searchQuery,
          filters: {
            ...(category && category !== 'All' ? { category } : {}),
            inStock: true
          }
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

  // Fetch all reviews for a product, including username and date
  static async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        id, 
        rating, 
        title, 
        comment, 
        created_at, 
        user_id,
        profiles!user_id(first_name, last_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Get single product by ID
  static async getProduct(productId: string): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:profiles!products_vendor_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get product images
  static async getProductImages(productId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get product attributes
  static async getProductAttributes(productId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get user review for a product
  static async getUserReview(productId: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }

  // Create product review
  static async createProductReview(review: {
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert([review])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update product review
  static async updateProductReview(reviewId: string, updates: {
    rating: number;
    comment?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update product attributes
  static async updateProductAttributes(productId: string, attributes: Omit<ProductAttribute, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]): Promise<{ data: any; error: any }> {
    try {
      // First, delete existing attributes
      await supabase
        .from('product_attributes')
        .delete()
        .eq('product_id', productId);

      // Then insert new attributes
      if (attributes.length > 0) {
        const attributesWithProductId = attributes.map(attr => ({
          ...attr,
          product_id: productId
        }));

        const { data, error } = await supabase
          .from('product_attributes')
          .insert(attributesWithProductId)
          .select();

        return { data, error };
      }

      return { data: [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update product images
  static async updateProductImages(productId: string, images: Omit<ProductImage, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]): Promise<{ data: any; error: any }> {
    try {
      // First, delete existing images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      // Then insert new images
      if (images.length > 0) {
        const imagesWithProductId = images.map(img => ({
          ...img,
          product_id: productId
        }));

        const { data, error } = await supabase
          .from('product_images')
          .insert(imagesWithProductId)
          .select();

        return { data, error };
      }

      return { data: [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
} 