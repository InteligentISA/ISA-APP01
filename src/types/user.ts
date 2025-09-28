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
  tax_id?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  commission_rate?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason?: string;
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