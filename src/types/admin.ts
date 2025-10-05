export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalVendors: number;
}

export interface AdminWithdrawal {
  id: string;
  vendor_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  request_date: string;
  processed_date?: string;
  notes?: string;
  vendor?: {
    first_name?: string;
    last_name?: string;
    business_name?: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

export interface AdminVendor {
  id: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  total_products: number;
  total_sales: number;
  commission_rate?: number;
  created_at: string;
}

export interface PaymentData {
  id: string;
  user_id?: string;
  order_id?: string;
  amount: number;
  currency?: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  mpesa_phone_number?: string;
  products?: Array<{
    name: string;
    quantity: number;
    price: number;
    vendor_name?: string;
  }>;
  vendor_id?: string;
}

export interface PaymentStats {
  totalPayments?: number;
  totalAmount?: number;
  successfulPayments?: number;
  pendingPayments?: number;
  failedPayments?: number;
  mpesaPayments?: number;
  cashPayments?: number;
  totalRevenue?: number;
  airtelMoneyPayments?: number;
}

export interface VendorApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  notes?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  company_website?: string;
  business_website?: string;
  tax_id?: string;
  admin_notes?: string;
}