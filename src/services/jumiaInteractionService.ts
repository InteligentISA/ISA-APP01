import { supabase } from '@/integrations/supabase/client';

export interface JumiaProductInteraction {
  id: string;
  user_id: string;
  jumia_product_id: string; // The unique identifier from Jumia
  jumia_product_name: string;
  jumia_product_price: number;
  jumia_product_link: string;
  jumia_product_image: string;
  interaction_type: 'like' | 'unlike' | 'view' | 'add_to_cart' | 'click';
  interaction_data?: Record<string, any>;
  created_at: string;
}

export interface JumiaProductAnalytics {
  product_id: string;
  product_name: string;
  total_likes: number;
  total_views: number;
  total_clicks: number;
  total_cart_adds: number;
  last_interaction_at: string;
}

export class JumiaInteractionService {
  // Track interaction with Jumia product
  static async trackInteraction(
    userId: string,
    jumiaProduct: {
      id: string;
      name: string;
      price: number;
      link: string;
      image: string;
    },
    interactionType: JumiaProductInteraction['interaction_type'],
    interactionData?: Record<string, any>
  ): Promise<{ data: JumiaProductInteraction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jumia_product_interactions')
        .insert({
          user_id: userId,
          jumia_product_id: jumiaProduct.id,
          jumia_product_name: jumiaProduct.name,
          jumia_product_price: jumiaProduct.price,
          jumia_product_link: jumiaProduct.link,
          jumia_product_image: jumiaProduct.image,
          interaction_type: interactionType,
          interaction_data: interactionData
        })
        .select()
        .single();

      return { data: data as JumiaProductInteraction, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get user's liked Jumia products
  static async getLikedJumiaProducts(userId: string): Promise<{ data: JumiaProductInteraction[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jumia_product_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .order('created_at', { ascending: false });

      return { data: (data || []) as JumiaProductInteraction[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Check if user has liked a specific Jumia product
  static async isJumiaProductLiked(userId: string, jumiaProductId: string): Promise<{ liked: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jumia_product_interactions')
        .select('id')
        .eq('user_id', userId)
        .eq('jumia_product_id', jumiaProductId)
        .eq('interaction_type', 'like')
        .limit(1);

      if (error) return { liked: false, error };
      return { liked: (data && data.length > 0), error: null };
    } catch (error) {
      return { liked: false, error };
    }
  }

  // Get user's Jumia interaction history
  static async getUserJumiaInteractionHistory(
    userId: string,
    interactionType?: JumiaProductInteraction['interaction_type'],
    limit: number = 50
  ): Promise<{ data: JumiaProductInteraction[]; error: any }> {
    try {
      let query = supabase
        .from('jumia_product_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      const { data, error } = await query;
      return { data: (data || []) as JumiaProductInteraction[], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get Jumia product analytics
  static async getJumiaProductAnalytics(jumiaProductId: string): Promise<{ data: JumiaProductAnalytics | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jumia_product_interactions')
        .select('*')
        .eq('jumia_product_id', jumiaProductId);

      if (error) return { data: null, error };

      if (!data || data.length === 0) {
        return { data: null, error: null };
      }

      const analytics: JumiaProductAnalytics = {
        product_id: jumiaProductId,
        product_name: data[0].jumia_product_name,
        total_likes: data.filter(d => d.interaction_type === 'like').length,
        total_views: data.filter(d => d.interaction_type === 'view').length,
        total_clicks: data.filter(d => d.interaction_type === 'click').length,
        total_cart_adds: data.filter(d => d.interaction_type === 'add_to_cart').length,
        last_interaction_at: data[0].created_at
      };

      return { data: analytics, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get trending Jumia products (based on likes and views)
  static async getTrendingJumiaProducts(limit: number = 10): Promise<{ data: JumiaProductAnalytics[]; error: any }> {
    try {
      // Get all interactions from the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('jumia_product_interactions')
        .select('*')
        .gte('created_at', sevenDaysAgo);

      if (error) return { data: [], error };

      // Group by product and calculate analytics
      const productMap = new Map<string, JumiaProductAnalytics>();

      data?.forEach(interaction => {
        const productId = interaction.jumia_product_id;
        
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: interaction.jumia_product_name,
            total_likes: 0,
            total_views: 0,
            total_clicks: 0,
            total_cart_adds: 0,
            last_interaction_at: interaction.created_at
          });
        }

        const analytics = productMap.get(productId)!;
        const countKey = `total_${interaction.interaction_type}s`;
        if (countKey in analytics && typeof (analytics as any)[countKey] === 'number') {
          (analytics as any)[countKey] = ((analytics as any)[countKey] as number) + 1;
        }
      });

      // Sort by total interactions and return top products
      const sortedProducts = Array.from(productMap.values())
        .sort((a, b) => {
          const aTotal = a.total_likes + a.total_views + a.total_clicks;
          const bTotal = b.total_likes + b.total_views + b.total_clicks;
          return bTotal - aTotal;
        })
        .slice(0, limit);

      return { data: sortedProducts, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Remove like for Jumia product
  static async unlikeJumiaProduct(userId: string, jumiaProductId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('jumia_product_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('jumia_product_id', jumiaProductId)
        .eq('interaction_type', 'like');

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Get user's Jumia product preferences (categories they interact with most)
  static async getUserJumiaPreferences(userId: string): Promise<{ data: Record<string, number>; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jumia_product_interactions')
        .select('interaction_data')
        .eq('user_id', userId)
        .not('interaction_data', 'is', null);

      if (error) return { data: {}, error };

      // Extract categories from interaction data
      const categoryCounts: Record<string, number> = {};
      
      data?.forEach(interaction => {
        const interactionData = interaction.interaction_data as Record<string, any> | null;
        if (interactionData?.category) {
          const category = interactionData.category as string;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      return { data: categoryCounts, error: null };
    } catch (error) {
      return { data: {}, error };
    }
  }
} 