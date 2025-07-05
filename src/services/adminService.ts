
import { supabase } from '@/integrations/supabase/client';

export interface VendorApplication {
  id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_license: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
}

export interface AdminAnalytics {
  total_users: number;
  total_vendors: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_applications: number;
}

export interface VendorCommission {
  id: string;
  vendor_id: string;
  order_id: string;
  product_id: string;
  commission_amount: number;
  commission_percentage: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at?: string;
}

export class AdminService {
  // Get all users
  static async getUsers(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get all products
  static async getAllProducts(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get all orders
  static async getAllOrders(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get basic analytics (simplified version)
  static async getAnalytics(): Promise<{ data: AdminAnalytics | null; error: any }> {
    try {
      // Get counts from different tables
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const analytics: AdminAnalytics = {
        total_users: usersResult.count || 0,
        total_vendors: 0, // Would need vendor role filtering
        total_products: productsResult.count || 0,
        total_orders: ordersResult.count || 0,
        total_revenue: totalRevenue,
        pending_applications: 0
      };

      return { data: analytics, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update user role
  static async updateUserRole(userId: string, role: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Update product status
  static async updateProductStatus(productId: string, isActive: boolean): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      return { error };
    } catch (error) {
      return { error };
    }
  }
}
