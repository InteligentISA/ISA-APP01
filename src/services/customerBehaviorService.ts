import { supabase } from '../integrations/supabase/client';
import { Product } from '../types/product';

// Simple internal types for this service
interface UserInteraction {
  id: string;
  user_id: string;
  product_id: string;
  interaction_type: string;
  created_at: string;
}

export class CustomerBehaviorService {
  // Track user-product interactions
  static async trackInteraction(
    userId: string, 
    productId: string, 
    interactionType: 'view' | 'like' | 'add_to_cart' | 'purchase' | 'share' | 'review',
    interactionData?: Record<string, any>
  ): Promise<{ data: UserInteraction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_product_interactions')
        .insert({
          user_id: userId,
          product_id: productId,
          interaction_type: interactionType,
          interaction_data: interactionData
        })
        .select()
        .maybeSingle();

      return { data: data as UserInteraction | null, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get popular products
  static async getPopularProducts(limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('review_count', { ascending: false })
        .limit(limit);
      
      return { data: (products || []) as unknown as Product[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get trending products (based on recent interactions)
  static async getTrendingProducts(limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(limit);
      
      return { data: (products || []) as unknown as Product[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get personalized recommendations for a user
  static async getUserRecommendations(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      // Get products the user has interacted with
      const { data: interactions } = await supabase
        .from('user_product_interactions')
        .select('product_id')
        .eq('user_id', userId)
        .limit(50);

      const interactedProductIds = interactions?.map(i => i.product_id) || [];

      // Get products from similar categories
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      return { data: (products || []) as unknown as Product[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get recently viewed products
  static async getRecentlyViewedProducts(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: interactions } = await supabase
        .from('user_product_interactions')
        .select('product_id')
        .eq('user_id', userId)
        .eq('interaction_type', 'view')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!interactions || interactions.length === 0) {
        return { data: [], error: null };
      }

      const productIds = interactions.map(i => i.product_id);
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      return { data: (products || []) as unknown as Product[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get user's liked products
  static async getLikedProducts(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: interactions } = await supabase
        .from('user_product_interactions')
        .select('product_id')
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!interactions || interactions.length === 0) {
        return { data: [], error: null };
      }

      const productIds = interactions.map(i => i.product_id);
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      return { data: (products || []) as unknown as Product[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get similar products (based on category and tags)
  static async getSimilarProducts(productId: string, limit: number = 6): Promise<{ data: Product[]; error: any }> {
    try {
      const { data: targetProduct } = await supabase
        .from('products')
        .select('category')
        .eq('id', productId)
        .single();

      if (!targetProduct) {
        return { data: [], error: null };
      }

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', targetProduct.category)
        .eq('is_active', true)
        .neq('id', productId)
        .order('rating', { ascending: false })
        .limit(limit);

      return { data: (products || []) as unknown as Product[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get user interaction history
  static async getUserInteractionHistory(
    userId: string, 
    interactionType?: string,
    limit: number = 50
  ): Promise<{ data: UserInteraction[]; error: any }> {
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
      return { data: (data || []) as UserInteraction[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get analytics for vendors
  static async getVendorAnalytics(vendorId: string): Promise<{
    total_views: number;
    total_likes: number;
    total_cart_adds: number;
    total_purchases: number;
    conversion_rate: number;
    top_products: Product[];
    error: any;
  }> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', vendorId);

      if (!products || products.length === 0) {
        return {
          total_views: 0,
          total_likes: 0,
          total_cart_adds: 0,
          total_purchases: 0,
          conversion_rate: 0,
          top_products: [],
          error: null
        };
      }

      const productIds = products.map(p => p.id);

      // Get interaction counts
      const { data: interactions } = await supabase
        .from('user_product_interactions')
        .select('interaction_type')
        .in('product_id', productIds);

      const counts = {
        view: 0,
        like: 0,
        add_to_cart: 0,
        purchase: 0
      };

      interactions?.forEach(i => {
        const type = i.interaction_type as keyof typeof counts;
        if (counts[type] !== undefined) counts[type]++;
      });

      // Get top products by rating
      const { data: topProducts } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('rating', { ascending: false })
        .limit(5);

      return {
        total_views: counts.view,
        total_likes: counts.like,
        total_cart_adds: counts.add_to_cart,
        total_purchases: counts.purchase,
        conversion_rate: counts.view > 0 ? counts.purchase / counts.view : 0,
        top_products: (topProducts || []) as unknown as Product[],
        error: null
      };
    } catch (error) {
      return {
        total_views: 0,
        total_likes: 0,
        total_cart_adds: 0,
        total_purchases: 0,
        conversion_rate: 0,
        top_products: [],
        error
      };
    }
  }
}