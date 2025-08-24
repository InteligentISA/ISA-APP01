import { supabase } from "@/integrations/supabase/client";

export interface CommissionInfo {
  commission_rate: number;
  isa_commission: number;
  vendor_earnings: number;
  plan_type: string;
}

export interface SubscriptionBenefits {
  product_limit: number;
  commission_rate: string;
}

export class CommissionService {
  // Fallback commission rates when the new tables don't exist
  private static FALLBACK_COMMISSION_RATES: Record<string, { freemium: number; premium: number }> = {
    'Electronics': { freemium: 12, premium: 6 },
    'Fashion': { freemium: 10, premium: 5 },
    'Home & Living': { freemium: 8, premium: 4 },
    'Books & Stationery': { freemium: 6, premium: 3 },
    'Baby Products': { freemium: 8, premium: 4 },
    'Health & Beauty': { freemium: 10, premium: 5 },
    'Tools & Home Improvement': { freemium: 8, premium: 4 },
    'Automotive': { freemium: 8, premium: 4 },
    'Travel & Luggage': { freemium: 8, premium: 4 },
    'Groceries': { freemium: 6, premium: 3 },
    'Office & Industrial': { freemium: 8, premium: 4 },
    'Alcoholic Beverages': { freemium: 8, premium: 4 },
    'Swimwear': { freemium: 10, premium: 5 }
  };

  static async getVendorSubscriptionPlan(vendorId: string): Promise<string> {
    try {
      // First try to get from the new vendor_subscriptions table
      const { data, error } = await supabase
        .from('vendor_subscriptions' as any)
        .select('plan_type')
        .eq('vendor_id', vendorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return (data as any).plan_type;
      }
    } catch (error) {
      console.log('Vendor subscription table not available, falling back to profiles');
    }

    // Fallback to profiles.preferences
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', vendorId)
        .single();

      if (profile?.preferences) {
        let preferences = profile.preferences;
        if (typeof preferences === 'string') {
          try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
        }
        
        if (preferences && typeof preferences === 'object' && 'plan' in preferences) {
          return preferences.plan as string;
        }
      }
    } catch (error) {
      console.error('Error fetching vendor plan from profiles:', error);
    }

    return 'freemium'; // Default fallback
  }

  static async getCommissionRate(vendorId: string, categoryPath: string): Promise<number> {
    try {
      // First try to get from the new vendor_commission_rates table
      const { data, error } = await supabase
        .from('vendor_commission_rates' as any)
        .select('freemium_commission_rate, premium_commission_rate')
        .eq('category_path', categoryPath)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!error && data) {
        const planType = await this.getVendorSubscriptionPlan(vendorId);
        const isPremium = planType.startsWith('premium') || planType === 'pro';
        return isPremium ? (data as any).premium_commission_rate : (data as any).freemium_commission_rate;
      }
    } catch (error) {
      console.log('Commission rates table not available, using fallback rates');
    }

    // Fallback to hardcoded rates
    const planType = await this.getVendorSubscriptionPlan(vendorId);
    const isPremium = planType.startsWith('premium') || planType === 'pro';
    
    // Find the best matching category
    const mainCategory = categoryPath.split('/')[0];
    const fallbackRate = this.FALLBACK_COMMISSION_RATES[mainCategory] || this.FALLBACK_COMMISSION_RATES['Fashion'];
    
    return isPremium ? fallbackRate.premium : fallbackRate.freemium;
  }

  static async getCommissionInfo(vendorId: string, categoryPath: string, price: number): Promise<CommissionInfo> {
    const commissionRate = await this.getCommissionRate(vendorId, categoryPath);
    const isaCommission = (price * commissionRate) / 100;
    const vendorEarnings = price - isaCommission;
    const planType = await this.getVendorSubscriptionPlan(vendorId);

    return {
      commission_rate: commissionRate,
      isa_commission: isaCommission,
      vendor_earnings: vendorEarnings,
      plan_type: planType
    };
  }

  static async getVendorSubscription(vendorId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('vendor_subscriptions' as any)
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.log('Vendor subscription table not available');
    }

    return null;
  }

  static async hasActiveSubscription(vendorId: string): Promise<boolean> {
    const subscription = await this.getVendorSubscription(vendorId);
    return subscription !== null;
  }

  static async getSubscriptionBenefits(vendorId: string): Promise<SubscriptionBenefits> {
    const planType = await this.getVendorSubscriptionPlan(vendorId);
    
    const benefits: Record<string, SubscriptionBenefits> = {
      'freemium': { product_limit: 5, commission_rate: '8-12%' },
      'premium_weekly': { product_limit: 20, commission_rate: '5-9%' },
      'premium_monthly': { product_limit: 20, commission_rate: '4-8%' },
      'premium_yearly': { product_limit: 20, commission_rate: '3-7%' },
      'pro': { product_limit: Infinity, commission_rate: '2-6%' }
    };

    return benefits[planType] || benefits['freemium'];
  }
}
