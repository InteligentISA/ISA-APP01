import { supabase } from '@/integrations/supabase/client';
import { 
  UserProductInteraction, 
  UserPreference, 
  ProductPopularity, 
  UserRecommendation,
  Product 
} from '@/types/product';

export class CustomerBehaviorService {
  // Track user-product interactions
  static async trackInteraction(
    userId: string, 
    productId: string, 
    interactionType: UserProductInteraction['interaction_type'],
    interactionData?: Record<string, any>
  ): Promise<{ data: UserProductInteraction | null; error: any }> {
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
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string): Promise<{ data: UserPreference[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('preference_score', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get product popularity
  static async getProductPopularity(productId: string): Promise<{ data: ProductPopularity | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_popularity')
        .select('*')
        .eq('product_id', productId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get popular products
  static async getPopularProducts(limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_popularity')
        .select(`
          *,
          product:products(*)
        `)
        .order('conversion_rate', { ascending: false })
        .order('purchase_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const products = data?.map(item => item.product).filter(Boolean) || [];
      return { data: products, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get trending products (based on recent interactions)
  static async getTrendingProducts(limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('product_popularity')
        .select(`
          *,
          product:products(*)
        `)
        .gte('last_updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const products = data?.map(item => item.product).filter(Boolean) || [];
      return { data: products, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get personalized recommendations for a user
  static async getUserRecommendations(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      // First, get user preferences
      const { data: preferences } = await this.getUserPreferences(userId);
      
      if (!preferences || preferences.length === 0) {
        // If no preferences, return popular products
        return this.getPopularProducts(limit);
      }

      // Get products from user's preferred categories
      const preferredCategories = preferences
        .filter(p => p.preference_score > 0.3) // Only consider significant preferences
        .map(p => p.category);

      if (preferredCategories.length === 0) {
        return this.getPopularProducts(limit);
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', preferredCategories)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get recently viewed products
  static async getRecentlyViewedProducts(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_product_interactions')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .eq('interaction_type', 'view')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const products = data?.map(item => item.product).filter(Boolean) || [];
      return { data: products, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get user's liked products
  static async getLikedProducts(userId: string, limit: number = 10): Promise<{ data: Product[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_product_interactions')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const products = data?.map(item => item.product).filter(Boolean) || [];
      return { data: products, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get similar products (based on category and tags)
  static async getSimilarProducts(productId: string, limit: number = 6): Promise<{ data: Product[]; error: any }> {
    try {
      // First, get the target product
      const { data: targetProduct, error: targetError } = await supabase
        .from('products')
        .select('*')
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
    interactionType?: UserProductInteraction['interaction_type'],
    limit: number = 50
  ): Promise<{ data: UserProductInteraction[]; error: any }> {
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
      // Get all products for the vendor
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

      // Get popularity data for all vendor products
      const { data: popularityData } = await supabase
        .from('product_popularity')
        .select(`
          *,
          product:products(*)
        `)
        .in('product_id', productIds);

      if (!popularityData) {
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

      // Calculate totals
      const totals = popularityData.reduce((acc, item) => ({
        total_views: acc.total_views + item.view_count,
        total_likes: acc.total_likes + item.like_count,
        total_cart_adds: acc.total_cart_adds + item.cart_add_count,
        total_purchases: acc.total_purchases + item.purchase_count,
      }), {
        total_views: 0,
        total_likes: 0,
        total_cart_adds: 0,
        total_purchases: 0,
      });

      const conversion_rate = totals.total_views > 0 ? totals.total_purchases / totals.total_views : 0;

      // Get top products by conversion rate
      const topProducts = popularityData
        .filter(item => item.product)
        .sort((a, b) => b.conversion_rate - a.conversion_rate)
        .slice(0, 5)
        .map(item => item.product);

      return {
        ...totals,
        conversion_rate,
        top_products: topProducts,
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