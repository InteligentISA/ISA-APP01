
import { supabase } from '../integrations/supabase/client';
import { Product } from '../types/product';

// Simplified interfaces that work with existing database
interface SimpleUserInteraction {
  id: string;
  user_id: string;
  product_id: string;
  interaction_type: 'view' | 'like' | 'add_to_cart' | 'purchase' | 'review' | 'share';
  created_at: string;
}

export class CustomerBehaviorService {
  // Track user-product interactions using existing table
  static async trackInteraction(
    userId: string, 
    productId: string, 
    interactionType: 'view' | 'like' | 'add_to_cart' | 'purchase' | 'review' | 'share',
    interactionData?: Record<string, any>
  ): Promise<{ data: SimpleUserInteraction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_product_interactions')
        .insert({
          user_id: userId,
          product_id: productId,
          interaction_type: interactionType
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get popular products from the product_popularity view
  static async getPopularProducts(limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_popularity')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform the data to match Product interface
      const products = data?.map(item => ({
        id: item.id || '',
        name: item.name || '',
        description: item.description,
        price: item.price || 0,
        original_price: item.original_price,
        category: item.category || '',
        subcategory: item.subcategory,
        brand: item.brand,
        images: item.images || [],
        main_image: item.main_image,
        stock_quantity: item.stock_quantity || 0,
        sku: item.sku,
        tags: item.tags || [],
        specifications: item.specifications as Record<string, any> || {},
        rating: item.rating || 0,
        review_count: item.review_count || 0,
        is_featured: item.is_featured || false,
        is_active: item.is_active || true,
        vendor_id: item.vendor_id,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        currency: 'KES',
        commission_percentage: 0,
        pickup_location: '',
        pickup_phone_number: ''
      })) || [];

      return { data: products, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get trending products (simplified version)
  static async getTrendingProducts(limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get recently viewed products
  static async getRecentlyViewedProducts(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: interactions, error: interactionError } = await supabase
        .from('user_product_interactions')
        .select('product_id')
        .eq('user_id', userId)
        .eq('interaction_type', 'view')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (interactionError) throw interactionError;
      
      const productIds = interactions?.map(item => item.product_id).filter(Boolean) || [];
      
      if (productIds.length === 0) return { data: [], error: null };

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      return { data: products || [], error: productsError };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get similar products (based on category)
  static async getSimilarProducts(productId: string, limit: number = 6): Promise<{ data: Product[]; error: any }> {
    try {
      // First, get the target product
      const { data: targetProduct, error: targetError } = await supabase
        .from('products')
        .select('category')
        .eq('id', productId)
        .single();

      if (targetError || !targetProduct) {
        return { data: [], error: targetError };
      }

      // Get similar products from the same category
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', targetProduct.category)
        .eq('is_active', true)
        .neq('id', productId)
        .order('rating', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get user interaction history
  static async getUserInteractionHistory(
    userId: string, 
    interactionType?: 'view' | 'like' | 'add_to_cart' | 'purchase' | 'review' | 'share',
    limit: number = 50
  ): Promise<{ data: SimpleUserInteraction[]; error: any }> {
    try {
      let query = supabase
        .from('user_product_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }
}
