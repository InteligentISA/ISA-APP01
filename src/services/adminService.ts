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

export interface PaymentData {
  id: string;
  order_id: string;
  order_number: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  mpesa_phone_number?: string;
  mpesa_transaction_id?: string;
  created_at: string;
  updated_at: string;
  
  // Order details
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  
  // Customer details
  customer_name?: string;
  
  // Product details
  products: {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    vendor_id?: string;
    vendor_name?: string;
  }[];
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  mpesaPayments: number;
  cashPayments: number;
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
    try {
      console.log('AdminService: Approving vendor application:', { appId, adminNotes });
      
      // First, check if the profile exists and is a vendor
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, user_type, status')
        .eq('id', appId)
        .single();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      console.log('AdminService: Existing profile:', existingProfile);

      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      if (existingProfile.user_type !== 'vendor') {
        throw new Error('Profile is not a vendor');
      }

      // Update the profile
      const { data: updateData, error } = await supabase
        .from('profiles')
        .update({ 
          status: 'approved',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appId)
        .eq('user_type', 'vendor')
        .select();

      if (error) {
        console.error('Error approving vendor application:', error);
        throw error;
      }
      
      console.log('AdminService: Vendor application approved successfully:', updateData);
    } catch (error) {
      console.error('Error approving vendor application:', error);
      throw error;
    }
  }

  static async rejectVendorApplication(appId: string, adminNotes: string): Promise<void> {
    try {
      console.log('AdminService: Rejecting vendor application:', { appId, adminNotes });
      
      // First, check if the profile exists and is a vendor
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, user_type, status')
        .eq('id', appId)
        .single();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      console.log('AdminService: Existing profile:', existingProfile);

      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      if (existingProfile.user_type !== 'vendor') {
        throw new Error('Profile is not a vendor');
      }

      // Update the profile
      const { data: updateData, error } = await supabase
        .from('profiles')
        .update({ 
          status: 'rejected',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appId)
        .eq('user_type', 'vendor')
        .select();

      if (error) {
        console.error('Error rejecting vendor application:', error);
        throw error;
      }
      
      console.log('AdminService: Vendor application rejected successfully:', updateData);
    } catch (error) {
      console.error('Error rejecting vendor application:', error);
      throw error;
    }
  }

  static async getPendingVendorApplications(): Promise<VendorApplication[]> {
    try {
      console.log('AdminService: Fetching pending vendor applications...');
      
      // First, let's check what's in the profiles table
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,email,phone_number,company,business_type,status,admin_notes,created_at,user_type')
        .order('created_at', { ascending: false });

      if (allProfilesError) {
        console.error('Error fetching all profiles:', allProfilesError);
        throw allProfilesError;
      }

      console.log('AdminService: All profiles:', allProfiles?.length || 0);
      console.log('AdminService: Profile details:', allProfiles);

      // Get all vendors with their details including email
      const { data: vendors, error } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,email,phone_number,company,business_type,status,admin_notes,created_at')
        .eq('user_type', 'vendor')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }

      console.log('AdminService: Found vendors:', vendors?.length || 0);
      console.log('AdminService: Vendor details:', vendors);

      // Transform the data to match VendorApplication interface
      const transformedVendors = (vendors || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        business_name: profile.company || 'N/A',
        business_description: profile.business_type || 'N/A',
        business_address: 'N/A',
        business_phone: profile.phone_number || 'N/A',
        business_email: profile.email,
        business_website: 'N/A',
        tax_id: 'N/A',
        status: profile.status || 'pending',
        admin_notes: profile.admin_notes || '',
        created_at: profile.created_at,
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        }
      }));

      console.log('AdminService: Transformed vendors:', transformedVendors);
      return transformedVendors;
    } catch (error) {
      console.error('Error fetching vendor applications:', error);
      throw error;
    }
  }

  static async getAllVendorApplications(): Promise<VendorApplication[]> {
    try {
      console.log('AdminService: Fetching all vendor applications...');
      
      // Get all vendors regardless of status
      const { data: vendors, error } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,email,phone_number,company,business_type,status,admin_notes,created_at')
        .eq('user_type', 'vendor')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all vendors:', error);
        throw error;
      }

      console.log('AdminService: Found all vendors:', vendors?.length || 0);
      console.log('AdminService: All vendor details:', vendors);

      // Transform the data to match VendorApplication interface
      return (vendors || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        business_name: profile.company || 'N/A',
        business_description: profile.business_type || 'N/A',
        business_address: 'N/A',
        business_phone: profile.phone_number || 'N/A',
        business_email: profile.email,
        business_website: 'N/A',
        tax_id: 'N/A',
        status: profile.status || 'pending',
        admin_notes: profile.admin_notes || '',
        created_at: profile.created_at,
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        }
      }));
    } catch (error) {
      console.error('Error fetching all vendor applications:', error);
      throw error;
    }
  }

  static async getApprovedVendorApplications(): Promise<VendorApplication[]> {
    try {
      const { data: vendors, error } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,email,phone_number,company,business_type,status,admin_notes,created_at')
        .eq('user_type', 'vendor')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved vendors:', error);
        throw error;
      }

      return (vendors || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        business_name: profile.company || 'N/A',
        business_description: profile.business_type || 'N/A',
        business_address: 'N/A',
        business_phone: profile.phone_number || 'N/A',
        business_email: profile.email,
        business_website: 'N/A',
        tax_id: 'N/A',
        status: profile.status || 'approved',
        admin_notes: profile.admin_notes || '',
        created_at: profile.created_at,
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        }
      }));
    } catch (error) {
      console.error('Error fetching approved vendor applications:', error);
      throw error;
    }
  }

  static async getRejectedVendorApplications(): Promise<VendorApplication[]> {
    try {
      const { data: vendors, error } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,email,phone_number,company,business_type,status,admin_notes,created_at')
        .eq('user_type', 'vendor')
        .eq('status', 'rejected')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rejected vendors:', error);
        throw error;
      }

      return (vendors || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        business_name: profile.company || 'N/A',
        business_description: profile.business_type || 'N/A',
        business_address: 'N/A',
        business_phone: profile.phone_number || 'N/A',
        business_email: profile.email,
        business_website: 'N/A',
        tax_id: 'N/A',
        status: profile.status || 'rejected',
        admin_notes: profile.admin_notes || '',
        created_at: profile.created_at,
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        }
      }));
    } catch (error) {
      console.error('Error fetching rejected vendor applications:', error);
      throw error;
    }
  }

  // Alternative method if the database function doesn't work
  static async getPendingVendorApplicationsAlternative(): Promise<VendorApplication[]> {
    try {
      console.log('AdminService: Fetching pending vendor applications (alternative method)...');
      
      // First, get all vendors from profiles
      const { data: vendors, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone_number,
          company,
          business_type,
          status,
          created_at
        `)
        .eq('user_type', 'vendor')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }

      console.log('AdminService: Found vendors:', vendors?.length || 0);

      // Filter to only show pending vendors
      const pendingVendors = vendors?.filter(vendor => 
        !vendor.status || vendor.status === 'pending'
      ) || [];

      console.log('AdminService: Pending vendors:', pendingVendors.length);

      // For now, we'll use a placeholder email since we can't easily fetch from auth.users
      // In a real implementation, you might need to store email in profiles or use a different approach
      return pendingVendors.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        business_name: profile.company || 'N/A',
        business_description: profile.business_type || 'N/A',
        business_address: 'N/A',
        business_phone: profile.phone_number || 'N/A',
        business_email: 'Email not available', // Placeholder since we can't fetch from auth.users
        business_website: 'N/A',
        tax_id: 'N/A',
        status: profile.status || 'pending',
        admin_notes: '',
        created_at: profile.created_at,
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: 'Email not available' // Placeholder
        }
      }));
    } catch (error) {
      console.error('Error fetching vendor applications:', error);
      throw error;
    }
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

  // Fetch all successful payments with detailed information
  static async getSuccessfulPayments(): Promise<PaymentData[]> {
    try {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            customer_email,
            customer_phone,
            total_amount,
            created_at,
            profiles!orders_user_id_fkey(
              first_name,
              last_name
            )
          )
        `)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.warn('Payments table does not exist or error occurred:', paymentsError);
        return []; // Return empty array if payments table doesn't exist
      }

      if (!payments) return [];

      return payments.map(payment => {
        const order = payment.orders;
        const customer = order.profiles;
        
        return {
          id: payment.id,
          order_id: payment.order_id,
          order_number: order.order_number,
          payment_method: payment.payment_method,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          transaction_id: payment.transaction_id,
          mpesa_phone_number: payment.mpesa_phone_number,
          mpesa_transaction_id: payment.mpesa_transaction_id,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
          
          // Order details
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          total_amount: order.total_amount,
          
          // Customer details
          customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
          
          // Product details (simplified for now)
          products: []
        };
      });
    } catch (error) {
      console.error('Error fetching successful payments:', error);
      return []; // Return empty array on error
    }
  }

  // Fetch payment statistics
  static async getPaymentStats(): Promise<PaymentStats> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('status, payment_method, amount');

      if (error) {
        console.warn('Payments table does not exist or error occurred:', error);
        // Return default stats if payments table doesn't exist
        return {
          totalPayments: 0,
          totalAmount: 0,
          successfulPayments: 0,
          pendingPayments: 0,
          failedPayments: 0,
          mpesaPayments: 0,
          cashPayments: 0
        };
      }

      const payments = data || [];
      const stats = payments.reduce((acc, payment) => {
        acc.totalPayments++;
        acc.totalAmount += payment.amount || 0;

        switch (payment.status) {
          case 'succeeded':
            acc.successfulPayments++;
            break;
          case 'failed':
            acc.failedPayments++;
            break;
          case 'pending':
            acc.pendingPayments++;
            break;
        }

        switch (payment.payment_method) {
          case 'mpesa':
            acc.mpesaPayments++;
            break;
          case 'cash':
            acc.cashPayments++;
            break;
        }

        return acc;
      }, {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        mpesaPayments: 0,
        cashPayments: 0
      });

      return stats;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      // Return default stats on error
      return {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        mpesaPayments: 0,
        cashPayments: 0
      };
    }
  }

  // Fetch recent payments (last 30 days)
  static async getRecentPayments(limit: number = 10): Promise<PaymentData[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            customer_email,
            customer_phone,
            total_amount,
            created_at,
            profiles!orders_user_id_fkey(
              first_name,
              last_name
            )
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (paymentsError) throw paymentsError;

      if (!payments) return [];

      // Fetch order items for each payment
      const paymentsWithDetails = await Promise.all(
        payments.map(async (payment) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products!inner(
                id,
                name,
                vendor_id,
                profiles!products_vendor_id_fkey(
                  first_name,
                  last_name
                )
              )
            `)
            .eq('order_id', payment.order_id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return null;
          }

          const products = orderItems?.map(item => ({
            id: item.product_id,
            name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            vendor_id: item.products?.vendor_id,
            vendor_name: item.products?.profiles 
              ? `${item.products.profiles.first_name || ''} ${item.products.profiles.last_name || ''}`.trim()
              : 'Unknown Vendor'
          })) || [];

          return {
            id: payment.id,
            order_id: payment.order_id,
            order_number: payment.orders.order_number,
            payment_method: payment.payment_method,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            transaction_id: payment.transaction_id,
            mpesa_phone_number: payment.mpesa_phone_number,
            mpesa_transaction_id: payment.mpesa_transaction_id,
            created_at: payment.created_at,
            updated_at: payment.updated_at,
            customer_email: payment.orders.customer_email,
            customer_phone: payment.orders.customer_phone,
            total_amount: payment.orders.total_amount,
            customer_name: payment.orders.profiles 
              ? `${payment.orders.profiles.first_name || ''} ${payment.orders.profiles.last_name || ''}`.trim()
              : 'Unknown Customer',
            products
          };
        })
      );

      return paymentsWithDetails.filter(Boolean) as PaymentData[];
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw error;
    }
  }
} 