import { supabase } from '@/integrations/supabase/client';
import { CurrencyService } from './currencyService';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'premium';
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  priceKES: number;
  priceUSD: number;
  features: string[];
  description: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  billing_cycle: 'weekly' | 'monthly' | 'yearly';
  price_kes: number;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
}

export interface PaymentMethod {
  type: 'mpesa' | 'airtel' | 'card';
  details: {
    phoneNumber?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
}

export class SubscriptionService {
  // Available subscription plans
  static readonly PLANS: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Plan',
      type: 'free',
      billingCycle: 'monthly',
      priceKES: 0,
      priceUSD: 0,
      features: [
        'Basic product browsing',
        'Limited AI assistance (5 queries/day)',
        'Standard delivery',
        'Basic customer support'
      ],
      description: 'Perfect for getting started with ISA'
    },
    {
      id: 'premium_weekly',
      name: 'Premium Weekly',
      type: 'premium',
      billingCycle: 'weekly',
      priceKES: 199,
      priceUSD: 1.99,
      features: [
        'Unlimited AI shopping assistance',
        'Virtual try-on & personal styling',
        'Exclusive early access to drops',
        'Ad-free browsing',
        'Multiple wishlists',
        'Priority customer support',
        'Free delivery on orders over KES 2,000'
      ],
      description: 'Try premium features for a week'
    },
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      type: 'premium',
      billingCycle: 'monthly',
      priceKES: 699,
      priceUSD: 6.99,
      features: [
        'Unlimited AI shopping assistance',
        'Virtual try-on & personal styling',
        'Exclusive early access to drops',
        'Ad-free browsing',
        'Multiple wishlists',
        'Priority customer support',
        'Free delivery on orders over KES 2,000',
        'Monthly style recommendations'
      ],
      description: 'Most popular choice for regular shoppers'
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      type: 'premium',
      billingCycle: 'yearly',
      priceKES: 6999,
      priceUSD: 69.99,
      features: [
        'Unlimited AI shopping assistance',
        'Virtual try-on & personal styling',
        'Exclusive early access to drops',
        'Ad-free browsing',
        'Multiple wishlists',
        'Priority customer support',
        'Free delivery on all orders',
        'Monthly style recommendations',
        'Exclusive member events',
        '2 months free compared to monthly'
      ],
      description: 'Best value for long-term users'
    }
  ];

  // Currency conversion rates (simplified - in production, use real API)
  static readonly EXCHANGE_RATES = {
    USD: 100, // 1 USD = 100 KES (approximate)
    EUR: 110, // 1 EUR = 110 KES
    GBP: 130, // 1 GBP = 130 KES
    KES: 1
  };

  // Get all available plans
  static getPlans(): SubscriptionPlan[] {
    return this.PLANS;
  }

  // Get plan by ID
  static getPlan(planId: string): SubscriptionPlan | undefined {
    return this.PLANS.find(plan => plan.id === planId);
  }

  // Convert price between currencies using CurrencyService
  static convertPrice(price: number, fromCurrency: string, toCurrency: string): number {
    return CurrencyService.convertBetweenCurrencies(price, fromCurrency, toCurrency);
  }

  // Get plan price in specified currency
  static getPlanPrice(planId: string, currencyCode: string): number {
    const plan = this.getPlan(planId);
    if (!plan) return 0;
    
    return CurrencyService.convertFromKES(plan.priceKES, currencyCode);
  }

  // Format plan price with currency
  static formatPlanPrice(planId: string, currencyCode?: string): string {
    const plan = this.getPlan(planId);
    if (!plan) return '';
    
    const targetCurrency = currencyCode || CurrencyService.getSelectedCurrency().code;
    return CurrencyService.formatPrice(plan.priceKES, targetCurrency);
  }

  // Get user's current subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data as unknown as UserSubscription;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  // Create new subscription
  static async createSubscription(
    userId: string,
    planId: string,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; message: string; subscription?: UserSubscription }> {
    try {
      const plan = this.getPlan(planId);
      if (!plan) {
        return { success: false, message: 'Invalid plan selected' };
      }

      // Calculate expiry date
      const now = new Date();
      let expiresAt: Date;
      
      switch (plan.billingCycle) {
        case 'weekly':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          break;
        case 'yearly':
          expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          break;
        default:
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      // Cancel any existing active subscription
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: plan.type,
          billing_cycle: plan.billingCycle,
          price_kes: plan.priceKES,
          status: 'active',
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          auto_renew: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        return { success: false, message: 'Failed to create subscription' };
      }

      return { 
        success: true, 
        message: 'Subscription created successfully',
        subscription: data as unknown as UserSubscription
      };
    } catch (error) {
      console.error('Error in createSubscription:', error);
      return { success: false, message: 'An error occurred while creating subscription' };
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          auto_renew: false
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, message: 'Failed to cancel subscription' };
      }

      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return { success: false, message: 'An error occurred while cancelling subscription' };
    }
  }

  // Renew subscription
  static async renewSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ auto_renew: true })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error renewing subscription:', error);
        return { success: false, message: 'Failed to renew subscription' };
      }

      return { success: true, message: 'Subscription renewed successfully' };
    } catch (error) {
      console.error('Error in renewSubscription:', error);
      return { success: false, message: 'An error occurred while renewing subscription' };
    }
  }

  // Process payment
  static async processPayment(
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, integrate with actual payment gateways
      switch (paymentMethod.type) {
        case 'mpesa':
          return {
            success: true,
            message: `M-Pesa payment of ${currency} ${amount} processed successfully`,
            transactionId: `MP${Date.now()}`
          };
        case 'airtel':
          return {
            success: true,
            message: `Airtel Money payment of ${currency} ${amount} processed successfully`,
            transactionId: `AM${Date.now()}`
          };
        case 'card':
          return {
            success: true,
            message: `Card payment of ${currency} ${amount} processed successfully`,
            transactionId: `CD${Date.now()}`
          };
        default:
          return { success: false, message: 'Invalid payment method' };
      }
    } catch (error) {
      console.error('Error in processPayment:', error);
      return { success: false, message: 'Payment processing failed' };
    }
  }

  // Check if subscription is expired
  static isSubscriptionExpired(subscription: UserSubscription): boolean {
    if (!subscription.expires_at) return false;
    return new Date(subscription.expires_at) < new Date();
  }

  // Get days until expiry
  static getDaysUntilExpiry(subscription: UserSubscription): number {
    if (!subscription.expires_at) return 0;
    const expiryDate = new Date(subscription.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}


