-- Create subscription types and plans system
-- This allows users to subscribe to individual features like WhatsApp, Email, Mobile etc.

-- 1. Subscription Types Table (defines available types like WhatsApp, Email, Mobile)
CREATE TABLE IF NOT EXISTS public.subscription_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'WhatsApp', 'Email', 'Mobile'
  display_name TEXT NOT NULL, -- e.g., 'WhatsApp Notifications'
  description TEXT,
  icon_name TEXT, -- For UI icons
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subscription Plans Table (defines pricing tiers like Basic, Premium)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'Basic', 'Premium'
  display_name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  features JSONB DEFAULT '[]', -- Array of features included
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Plan Type Mappings (which subscription types are included in which plans)
CREATE TABLE IF NOT EXISTS public.subscription_plan_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
  type_id UUID REFERENCES public.subscription_types(id) ON DELETE CASCADE NOT NULL,
  is_included BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, type_id)
);

-- 4. User Subscriptions to Plans
CREATE TABLE IF NOT EXISTS public.user_plan_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_paid DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Active Subscription Types (what individual features user has active)
CREATE TABLE IF NOT EXISTS public.user_active_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type_id UUID REFERENCES public.subscription_types(id) ON DELETE RESTRICT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type_id)
);

-- Enable RLS
ALTER TABLE public.subscription_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_types (read-only for all authenticated users)
CREATE POLICY "Anyone can view subscription types" ON public.subscription_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage subscription types" ON public.subscription_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for subscription_plans (read-only for all authenticated users)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for subscription_plan_types (read-only for all authenticated users)
CREATE POLICY "Anyone can view plan type mappings" ON public.subscription_plan_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage plan type mappings" ON public.subscription_plan_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for user_plan_subscriptions
CREATE POLICY "Users can view their own plan subscriptions" ON public.user_plan_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plan subscriptions" ON public.user_plan_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan subscriptions" ON public.user_plan_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all plan subscriptions" ON public.user_plan_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for user_active_subscriptions
CREATE POLICY "Users can view their own active subscriptions" ON public.user_active_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own active subscriptions" ON public.user_active_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active subscriptions" ON public.user_active_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all active subscriptions" ON public.user_active_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_subscription_types_active ON public.subscription_types(is_active);
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX idx_subscription_plan_types_plan_id ON public.subscription_plan_types(plan_id);
CREATE INDEX idx_subscription_plan_types_type_id ON public.subscription_plan_types(type_id);
CREATE INDEX idx_user_plan_subscriptions_user_id ON public.user_plan_subscriptions(user_id);
CREATE INDEX idx_user_plan_subscriptions_status ON public.user_plan_subscriptions(status);
CREATE INDEX idx_user_active_subscriptions_user_id ON public.user_active_subscriptions(user_id);
CREATE INDEX idx_user_active_subscriptions_type_id ON public.user_active_subscriptions(type_id);
CREATE INDEX idx_user_active_subscriptions_active ON public.user_active_subscriptions(is_active);

-- Function to automatically set expiry date based on billing cycle
CREATE OR REPLACE FUNCTION public.set_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    IF NEW.billing_cycle = 'monthly' THEN
      NEW.expires_at := NEW.started_at + INTERVAL '1 month';
    ELSIF NEW.billing_cycle = 'yearly' THEN
      NEW.expires_at := NEW.started_at + INTERVAL '1 year';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription expiry
CREATE TRIGGER set_user_plan_subscription_expiry
  BEFORE INSERT OR UPDATE ON public.user_plan_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_subscription_expiry();

-- Function to activate subscription types when user subscribes to a plan
CREATE OR REPLACE FUNCTION public.activate_subscription_types()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user subscribes to a plan, activate all included subscription types
  INSERT INTO public.user_active_subscriptions (user_id, type_id, is_active, activated_at)
  SELECT NEW.user_id, spt.type_id, true, NOW()
  FROM public.subscription_plan_types spt
  WHERE spt.plan_id = NEW.plan_id
    AND spt.is_included = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_active_subscriptions uas
      WHERE uas.user_id = NEW.user_id AND uas.type_id = spt.type_id
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to activate subscription types on plan subscription
CREATE TRIGGER activate_types_on_plan_subscription
  AFTER INSERT ON public.user_plan_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.activate_subscription_types();

-- Insert default subscription types
INSERT INTO public.subscription_types (name, display_name, description, icon_name, sort_order) VALUES
('whatsapp', 'WhatsApp', 'Receive notifications and updates via WhatsApp', 'message-circle', 1),
('email', 'Email', 'Receive notifications and updates via Email', 'mail', 2),
('mobile', 'Mobile', 'Receive SMS and mobile notifications', 'smartphone', 3),
('push', 'Push Notifications', 'Receive browser push notifications', 'bell', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, currency, description, sort_order) VALUES
('basic', 'Basic Plan', 9.00, 99.00, 'USD', 'Basic access with essential features', 1),
('standard', 'Standard Plan', 19.00, 199.00, 'USD', 'Standard features for regular users', 2),
('premium', 'Premium Plan', 49.00, 499.00, 'USD', 'Premium features with priority support', 3),
('enterprise', 'Enterprise Plan', 99.00, 999.00, 'USD', 'Enterprise features with dedicated support', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default plan-to-type mappings
-- Basic Plan includes WhatsApp and Email
INSERT INTO public.subscription_plan_types (plan_id, type_id, is_included)
SELECT sp.id, st.id, true
FROM public.subscription_plans sp, public.subscription_types st
WHERE sp.name = 'basic' AND st.name IN ('whatsapp', 'email')
ON CONFLICT (plan_id, type_id) DO NOTHING;

-- Standard Plan includes WhatsApp, Email, and Mobile
INSERT INTO public.subscription_plan_types (plan_id, type_id, is_included)
SELECT sp.id, st.id, true
FROM public.subscription_plans sp, public.subscription_types st
WHERE sp.name = 'standard' AND st.name IN ('whatsapp', 'email', 'mobile')
ON CONFLICT (plan_id, type_id) DO NOTHING;

-- Premium Plan includes all types
INSERT INTO public.subscription_plan_types (plan_id, type_id, is_included)
SELECT sp.id, st.id, true
FROM public.subscription_plans sp, public.subscription_types st
WHERE sp.name = 'premium'
ON CONFLICT (plan_id, type_id) DO NOTHING;

-- Enterprise Plan includes all types
INSERT INTO public.subscription_plan_types (plan_id, type_id, is_included)
SELECT sp.id, st.id, true
FROM public.subscription_plans sp, public.subscription_types st
WHERE sp.name = 'enterprise'
ON CONFLICT (plan_id, type_id) DO NOTHING;

