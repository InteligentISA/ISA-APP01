
import { supabase } from "@/integrations/supabase/client";

export interface AdminAnalytics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentActivity: any[];
}

export interface VendorApplication {
  id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  tax_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_id: string;
  rejection_reason?: string;
}

export class AdminService {
  // Get admin analytics
  static async getAnalytics(): Promise<{ data: AdminAnalytics | null; error: any }> {
    try {
      // Get basic counts from existing tables
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount', { count: 'exact' })
      ]);

      if (usersResult.error || productsResult.error || ordersResult.error) {
        throw new Error('Failed to fetch analytics data');
      }

      // Calculate total revenue
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Get recent activity from orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const analytics: AdminAnalytics = {
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        recentActivity: recentOrders || []
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { data: null, error };
    }
  }

  // Get all users
  static async getUsers(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.error('Error updating user role:', error);
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
      console.error('Error deleting user:', error);
      return { error };
    }
  }

  // Get all products for admin management
  static async getAllProducts(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error };
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
      console.error('Error updating product status:', error);
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
      console.error('Error deleting product:', error);
      return { error };
    }
  }

  // Get all orders for admin management
  static async getAllOrders(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: null, error };
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      return { error };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { error };
    }
  }
}
