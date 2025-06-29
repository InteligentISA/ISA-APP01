import { supabase } from '@/integrations/supabase/client';

export interface VendorApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  tax_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AdminAnalytics {
  id: string;
  date: string;
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_vendors: number;
  commission_rate: number;
  total_commissions: number;
  created_at: string;
  updated_at: string;
}

export interface VendorCommission {
  id: string;
  vendor_id: string;
  order_id: string;
  product_id: string;
  sale_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  products: {
    name: string;
    price: number;
  };
}

export interface AdminSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_by: string;
  updated_at: string;
}

export class AdminService {
  // Vendor Applications
  static async getVendorApplications(): Promise<VendorApplication[]> {
    const { data, error } = await supabase
      .from('vendor_applications')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async approveVendorApplication(appId: string, adminNotes: string): Promise<void> {
    const { error } = await supabase.rpc('approve_vendor_application', {
      app_id: appId,
      admin_notes: adminNotes
    });

    if (error) throw error;
  }

  static async rejectVendorApplication(appId: string, adminNotes: string): Promise<void> {
    const { error } = await supabase.rpc('reject_vendor_application', {
      app_id: appId,
      admin_notes: adminNotes
    });

    if (error) throw error;
  }

  // Analytics
  static async getAnalytics(): Promise<any[]> {
    const { data, error } = await supabase
      .from('admin_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data || [];
  }

  static async calculateDailyAnalytics(date: string): Promise<void> {
    const { error } = await supabase.rpc('calculate_daily_analytics', {
      target_date: date
    });

    if (error) throw error;
  }

  // Vendor Commissions
  static async getVendorCommissions(): Promise<any[]> {
    const { data, error } = await supabase
      .from('vendor_commissions')
      .select(`
        *,
        profiles:vendor_id (
          first_name,
          last_name,
          email
        ),
        products:product_id (
          name,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateCommissionStatus(commissionId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> {
    const { error } = await supabase
      .from('vendor_commissions')
      .update({ 
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', commissionId);

    if (error) throw error;
  }

  // Best Selling Products
  static async getBestSellingProducts(country?: string, limit: number = 10): Promise<any[]> {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.category_id,
        pc.name as category_name,
        COUNT(oi.id) as total_orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
    `;

    if (country) {
      query += ` AND o.shipping_address->>'country' = '${country}'`;
    }

    query += `
      GROUP BY p.id, p.name, p.price, p.category_id, pc.name
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `;

    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    if (error) throw error;
    return data || [];
  }

  // Admin Settings
  static async getAdminSettings(): Promise<AdminSettings[]> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('setting_key');

    if (error) throw error;
    return data || [];
  }

  static async updateAdminSetting(settingKey: string, settingValue: any, description?: string): Promise<void> {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        description,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // Sales Analytics by Country
  static async getSalesByCountry(startDate?: string, endDate?: string): Promise<any[]> {
    let query = `
      SELECT 
        o.shipping_address->>'country' as country,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_amount) as total_sales,
        COUNT(DISTINCT o.user_id) as unique_customers
      FROM orders o
      WHERE o.status = 'completed'
    `;

    if (startDate) {
      query += ` AND o.created_at >= '${startDate}'`;
    }
    if (endDate) {
      query += ` AND o.created_at <= '${endDate}'`;
    }

    query += `
      GROUP BY o.shipping_address->>'country'
      ORDER BY total_sales DESC
    `;

    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    if (error) throw error;
    return data || [];
  }

  // Vendor Sales Summary
  static async getVendorSalesSummary(): Promise<any[]> {
    const query = `
      SELECT 
        p.id as vendor_id,
        p.first_name,
        p.last_name,
        p.email,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity * oi.unit_price) as total_sales,
        SUM(vc.commission_amount) as total_commissions,
        AVG(vc.commission_rate) as avg_commission_rate
      FROM profiles p
      LEFT JOIN products pr ON p.id = pr.vendor_id
      LEFT JOIN order_items oi ON pr.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN vendor_commissions vc ON o.id = vc.order_id AND pr.id = vc.product_id
      WHERE p.role = 'vendor' AND o.status = 'completed'
      GROUP BY p.id, p.first_name, p.last_name, p.email
      ORDER BY total_sales DESC
    `;

    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    if (error) throw error;
    return data || [];
  }
} 