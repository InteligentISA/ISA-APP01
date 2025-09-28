export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  location?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Vendor specific fields
  business_name?: string;
  business_description?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  company_website?: string;
  tax_id?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  commission_rate?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason?: string;
  admin_notes?: string;
}

export interface VendorApplication {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website?: string;
  company_website?: string;
  tax_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentData {
  id: string;
  user_id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  mpesa_phone_number?: string;
  products?: any[];
  created_at: string;
  updated_at: string;
}

export interface PaymentStats {
  totalAmount: number;
  totalTransactions: number;
  mpesaPayments: number;
  airtelMoneyPayments: number;
  pendingPayments: number;
  completedPayments: number;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  currency?: string;
  timezone?: string;
}