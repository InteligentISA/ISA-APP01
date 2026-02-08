/**
 * Subscription Types Service
 * Handles subscription types and plans management
 */

import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon_name: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  description: string | null;
  features: any;
  is_active: boolean;
  sort_order: number;
}

export interface UserPlanSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  price_paid: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  payment_method: string | null;
  transaction_id: string | null;
}

export interface UserActiveSubscription {
  id: string;
  user_id: string;
  type_id: string;
  is_active: boolean;
  activated_at: string;
  deactivated_at: string | null;
  subscription_type?: SubscriptionType;
}

export class SubscriptionTypesService {
  static async getSubscriptionTypes(): Promise<SubscriptionType[]> {
    const { data, error } = await (supabase as any)
      .from('subscription_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) { console.error('Error fetching subscription types:', error); throw error; }
    return data || [];
  }

  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await (supabase as any)
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) { console.error('Error fetching subscription plans:', error); throw error; }
    return data || [];
  }

  static async getPlanWithTypes(planId: string) {
    const { data: plan, error: planError } = await (supabase as any)
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) throw planError;

    const { data: types, error: typesError } = await (supabase as any)
      .from('subscription_plan_types')
      .select(`is_included, subscription_types (id, name, display_name, description, icon_name)`)
      .eq('plan_id', planId)
      .eq('is_included', true);

    if (typesError) throw typesError;
    return { plan, types };
  }

  static async getUserPlanSubscription(userId: string): Promise<UserPlanSubscription | null> {
    const { data, error } = await (supabase as any)
      .from('user_plan_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) { console.error('Error fetching user plan subscription:', error); throw error; }
    return data;
  }

  static async getUserActiveSubscriptions(userId: string): Promise<UserActiveSubscription[]> {
    const { data, error } = await (supabase as any)
      .from('user_active_subscriptions')
      .select(`*, subscription_types (id, name, display_name, description, icon_name)`)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) { console.error('Error fetching user active subscriptions:', error); throw error; }
    return data || [];
  }

  static async subscribeToPlan(
    userId: string, planId: string, billingCycle: 'monthly' | 'yearly',
    paymentMethod: string, transactionId: string
  ): Promise<UserPlanSubscription> {
    const plan = await this.getPlanDetails(planId);
    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

    const { data, error } = await (supabase as any)
      .from('user_plan_subscriptions')
      .insert({
        user_id: userId, plan_id: planId, billing_cycle: billingCycle,
        price_paid: price, currency: plan.currency, status: 'active',
        payment_method: paymentMethod, transaction_id: transactionId,
      })
      .select()
      .single();

    if (error) { console.error('Error subscribing to plan:', error); throw error; }
    return data;
  }

  static async toggleSubscriptionType(userId: string, typeId: string, isActive: boolean): Promise<void> {
    const { data: existing } = await (supabase as any)
      .from('user_active_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('type_id', typeId)
      .maybeSingle();

    if (existing) {
      const { error } = await (supabase as any)
        .from('user_active_subscriptions')
        .update({
          is_active: isActive,
          activated_at: isActive ? new Date().toISOString() : existing.activated_at,
          deactivated_at: isActive ? null : new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) { console.error('Error updating subscription type:', error); throw error; }
    } else if (isActive) {
      const { error } = await (supabase as any)
        .from('user_active_subscriptions')
        .insert({ user_id: userId, type_id: typeId, is_active: true });

      if (error) { console.error('Error creating subscription type:', error); throw error; }
    }
  }

  static async cancelPlanSubscription(userId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('user_plan_subscriptions')
      .update({ status: 'cancelled', auto_renew: false })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) { console.error('Error cancelling plan subscription:', error); throw error; }
  }

  static async getPlanDetails(planId: string): Promise<SubscriptionPlan> {
    const { data, error } = await (supabase as any)
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) { console.error('Error fetching plan details:', error); throw error; }
    return data;
  }

  static async hasSubscriptionType(userId: string, typeName: string): Promise<boolean> {
    const { data, error } = await (supabase as any)
      .from('user_active_subscriptions')
      .select(`*, subscription_types!inner (name)`)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('subscription_types.name', typeName)
      .maybeSingle();

    if (error) { console.error('Error checking subscription type access:', error); return false; }
    return data !== null;
  }
}
