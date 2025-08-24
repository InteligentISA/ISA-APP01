-- Create subscription and commission tables for vendor and customer subscriptions

-- Create vendor_subscriptions table
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('freemium', 'premium_weekly', 'premium_monthly', 'premium_yearly', 'pro')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('one-time', 'weekly', 'monthly', 'yearly')),
  price_kes DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table for customers
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  price_kes DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_commission_rates table for category-based commission rates
CREATE TABLE IF NOT EXISTS public.vendor_commission_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_path TEXT NOT NULL,
  main_category TEXT,
  subcategory TEXT,
  freemium_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.0,
  premium_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_path)
);

-- Create points_config table for subscription and loyalty settings
CREATE TABLE IF NOT EXISTS public.points_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  redemption_enabled BOOLEAN DEFAULT false,
  vendor_subscription_enabled BOOLEAN DEFAULT true,
  customer_premium_enabled BOOLEAN DEFAULT true,
  spending_points_rate DECIMAL(5,2) DEFAULT 1.0, -- Points per KES spent
  quiz_completion_points INTEGER DEFAULT 20,
  first_purchase_points INTEGER DEFAULT 100,
  referral_signup_points INTEGER DEFAULT 200,
  referral_purchase_points INTEGER DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_subscriptions
CREATE POLICY "Vendors can view their own subscriptions" ON public.vendor_subscriptions
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create their own subscriptions" ON public.vendor_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own subscriptions" ON public.vendor_subscriptions
  FOR UPDATE USING (auth.uid() = vendor_id);

-- Admins can manage all vendor subscriptions
CREATE POLICY "Admins can manage all vendor subscriptions" ON public.vendor_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all user subscriptions
CREATE POLICY "Admins can manage all user subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for vendor_commission_rates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view commission rates" ON public.vendor_commission_rates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage commission rates
CREATE POLICY "Admins can manage commission rates" ON public.vendor_commission_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for points_config (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view points config" ON public.points_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage points config
CREATE POLICY "Admins can manage points config" ON public.points_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_vendor_subscriptions_vendor_id ON public.vendor_subscriptions(vendor_id);
CREATE INDEX idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);
CREATE INDEX idx_vendor_subscriptions_plan_type ON public.vendor_subscriptions(plan_type);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_plan_type ON public.user_subscriptions(plan_type);

CREATE INDEX idx_vendor_commission_rates_category ON public.vendor_commission_rates(category_path);
CREATE INDEX idx_vendor_commission_rates_active ON public.vendor_commission_rates(is_active);

-- Insert default commission rates for common categories
INSERT INTO public.vendor_commission_rates (category_path, main_category, subcategory, freemium_commission_rate, premium_commission_rate) VALUES
('Electronics', 'Electronics', NULL, 12.0, 6.0),
('Electronics/Mobile Phones & Tablets', 'Electronics', 'Mobile Phones & Tablets', 12.0, 6.0),
('Electronics/Computers & Accessories', 'Electronics', 'Computers & Accessories', 12.0, 6.0),
('Electronics/TV, Audio & Video', 'Electronics', 'TV, Audio & Video', 12.0, 6.0),
('Fashion', 'Fashion', NULL, 10.0, 5.0),
('Fashion/Men', 'Fashion', 'Men', 10.0, 5.0),
('Fashion/Women', 'Fashion', 'Women', 10.0, 5.0),
('Fashion/Kids', 'Fashion', 'Kids', 10.0, 5.0),
('Home & Garden', 'Home & Garden', NULL, 8.0, 4.0),
('Sports & Outdoors', 'Sports & Outdoors', NULL, 8.0, 4.0),
('Beauty & Health', 'Beauty & Health', NULL, 10.0, 5.0),
('Books & Media', 'Books & Media', NULL, 6.0, 3.0),
('Automotive', 'Automotive', NULL, 8.0, 4.0),
('Toys & Games', 'Toys & Games', NULL, 8.0, 4.0),
('Food & Beverages', 'Food & Beverages', NULL, 6.0, 3.0)
ON CONFLICT (category_path) DO NOTHING;

-- Insert default points configuration
INSERT INTO public.points_config (
  redemption_enabled,
  vendor_subscription_enabled,
  customer_premium_enabled,
  spending_points_rate,
  quiz_completion_points,
  first_purchase_points,
  referral_signup_points,
  referral_purchase_points
) VALUES (
  true,
  true,
  true,
  1.0,
  20,
  100,
  200,
  200
) ON CONFLICT DO NOTHING;

-- Create function to update subscription expiry
CREATE OR REPLACE FUNCTION public.update_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Update expires_at when subscription is created or renewed
  IF NEW.expires_at IS NULL THEN
    CASE NEW.billing_cycle
      WHEN 'weekly' THEN
        NEW.expires_at := NEW.started_at + INTERVAL '7 days';
      WHEN 'monthly' THEN
        NEW.expires_at := NEW.started_at + INTERVAL '1 month';
      WHEN 'yearly' THEN
        NEW.expires_at := NEW.started_at + INTERVAL '1 year';
      WHEN 'one-time' THEN
        NEW.expires_at := NEW.started_at + INTERVAL '1 year'; -- Pro plan is one-time but expires after 1 year
      ELSE
        NEW.expires_at := NEW.started_at + INTERVAL '1 month';
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for subscription expiry
CREATE TRIGGER update_vendor_subscription_expiry
  BEFORE INSERT OR UPDATE ON public.vendor_subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.update_subscription_expiry();

CREATE TRIGGER update_user_subscription_expiry
  BEFORE INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.update_subscription_expiry();

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status()
RETURNS void AS $$
BEGIN
  -- Update expired vendor subscriptions
  UPDATE public.vendor_subscriptions 
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
  
  -- Update expired user subscriptions
  UPDATE public.user_subscriptions 
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to check subscription status (this would be set up in production)
-- For now, we'll create a function that can be called manually
