-- Admin System Migration
-- This migration creates the admin functionality with proper security

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin'));

-- Create vendor applications table
CREATE TABLE public.vendor_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  business_website TEXT,
  tax_id TEXT,
  bank_account_info JSONB,
  documents JSONB, -- Store document URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin analytics table for tracking sales and commissions
CREATE TABLE public.admin_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  total_vendors INTEGER DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Default 10% commission
  total_commissions DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create vendor commission tracking table
CREATE TABLE public.vendor_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sale_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin audit log for security tracking
CREATE TABLE public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('commission_rates', '{"default": 10.0, "premium": 15.0, "new_vendor": 8.0}', 'Commission rates for different vendor tiers'),
('vendor_approval', '{"auto_approve": false, "require_documents": true, "min_rating": 4.0}', 'Vendor approval settings'),
('platform_fees', '{"transaction_fee": 2.5, "listing_fee": 0.0}', 'Platform fee structure'),
('security', '{"session_timeout": 3600, "max_login_attempts": 5, "require_2fa": false}', 'Security settings');

-- Enable RLS on new tables
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_applications
CREATE POLICY "Users can view their own applications" ON public.vendor_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" ON public.vendor_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON public.vendor_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view and manage all applications
CREATE POLICY "Admins can manage all applications" ON public.vendor_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for admin_analytics (admin only)
CREATE POLICY "Only admins can access analytics" ON public.admin_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for vendor_commissions
CREATE POLICY "Vendors can view their own commissions" ON public.vendor_commissions
  FOR SELECT USING (auth.uid() = vendor_id);

-- Admins can manage all commissions
CREATE POLICY "Admins can manage all commissions" ON public.vendor_commissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for admin_audit_log (admin only)
CREATE POLICY "Only admins can access audit log" ON public.admin_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- RLS Policies for admin_settings (admin only)
CREATE POLICY "Only admins can access settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Function to automatically create audit log entries
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate daily analytics
CREATE OR REPLACE FUNCTION public.calculate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  daily_sales DECIMAL(12,2);
  daily_orders INTEGER;
  daily_customers INTEGER;
  daily_vendors INTEGER;
  daily_commissions DECIMAL(12,2);
BEGIN
  -- Calculate total sales for the day
  SELECT COALESCE(SUM(total_amount), 0)
  INTO daily_sales
  FROM public.orders
  WHERE DATE(created_at) = target_date AND status = 'completed';

  -- Calculate total orders for the day
  SELECT COALESCE(COUNT(*), 0)
  INTO daily_orders
  FROM public.orders
  WHERE DATE(created_at) = target_date;

  -- Calculate new customers for the day
  SELECT COALESCE(COUNT(*), 0)
  INTO daily_customers
  FROM public.profiles
  WHERE DATE(created_at) = target_date AND role = 'customer';

  -- Calculate new vendors for the day
  SELECT COALESCE(COUNT(*), 0)
  INTO daily_vendors
  FROM public.profiles
  WHERE DATE(created_at) = target_date AND role = 'vendor';

  -- Calculate total commissions for the day
  SELECT COALESCE(SUM(commission_amount), 0)
  INTO daily_commissions
  FROM public.vendor_commissions
  WHERE DATE(created_at) = target_date;

  -- Insert or update analytics for the day
  INSERT INTO public.admin_analytics (
    date,
    total_sales,
    total_orders,
    total_customers,
    total_vendors,
    total_commissions
  )
  VALUES (
    target_date,
    daily_sales,
    daily_orders,
    daily_customers,
    daily_vendors,
    daily_commissions
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_sales = EXCLUDED.total_sales,
    total_orders = EXCLUDED.total_orders,
    total_customers = EXCLUDED.total_customers,
    total_vendors = EXCLUDED.total_vendors,
    total_commissions = EXCLUDED.total_commissions,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve vendor application
CREATE OR REPLACE FUNCTION public.approve_vendor_application(app_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  app_user_id UUID;
BEGIN
  -- Get the user ID from the application
  SELECT user_id INTO app_user_id
  FROM public.vendor_applications
  WHERE id = app_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Update application status
  UPDATE public.vendor_applications
  SET 
    status = 'approved',
    admin_notes = admin_notes,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = app_id;

  -- Update user role to vendor
  UPDATE public.profiles
  SET role = 'vendor'
  WHERE id = app_user_id;

  -- Log the action
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    table_name,
    record_id,
    new_values
  )
  VALUES (
    auth.uid(),
    'APPROVE_VENDOR',
    'vendor_applications',
    app_id,
    jsonb_build_object('status', 'approved', 'admin_notes', admin_notes)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject vendor application
CREATE OR REPLACE FUNCTION public.reject_vendor_application(app_id UUID, admin_notes TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update application status
  UPDATE public.vendor_applications
  SET 
    status = 'rejected',
    admin_notes = admin_notes,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = app_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Log the action
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    table_name,
    record_id,
    new_values
  )
  VALUES (
    auth.uid(),
    'REJECT_VENDOR',
    'vendor_applications',
    app_id,
    jsonb_build_object('status', 'rejected', 'admin_notes', admin_notes)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate vendor commissions for an order
CREATE OR REPLACE FUNCTION public.calculate_order_commissions(order_id UUID)
RETURNS VOID AS $$
DECLARE
  order_item RECORD;
  commission_rate DECIMAL(5,2);
BEGIN
  -- Get commission rate from settings
  SELECT (setting_value->>'default')::DECIMAL(5,2) INTO commission_rate
  FROM public.admin_settings
  WHERE setting_key = 'commission_rates';

  -- Default commission rate if not found
  IF commission_rate IS NULL THEN
    commission_rate := 10.0;
  END IF;

  -- Calculate commissions for each order item
  FOR order_item IN
    SELECT 
      oi.id,
      oi.product_id,
      p.vendor_id,
      oi.quantity * oi.unit_price as sale_amount
    FROM public.order_items oi
    JOIN public.products p ON oi.product_id = p.id
    WHERE oi.order_id = order_id
  LOOP
    INSERT INTO public.vendor_commissions (
      vendor_id,
      order_id,
      product_id,
      sale_amount,
      commission_rate,
      commission_amount
    )
    VALUES (
      order_item.vendor_id,
      order_id,
      order_item.product_id,
      order_item.sale_amount,
      commission_rate,
      order_item.sale_amount * (commission_rate / 100)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER audit_vendor_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_admin_analytics
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_analytics
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_vendor_commissions
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_commissions
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_admin_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

-- Create trigger to calculate commissions when order is completed
CREATE OR REPLACE FUNCTION public.trigger_calculate_commissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.calculate_order_commissions(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_commissions_on_order_completion
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_calculate_commissions();

-- Create indexes for better performance
CREATE INDEX idx_vendor_applications_status ON public.vendor_applications(status);
CREATE INDEX idx_vendor_applications_user_id ON public.vendor_applications(user_id);
CREATE INDEX idx_admin_analytics_date ON public.admin_analytics(date);
CREATE INDEX idx_vendor_commissions_vendor_id ON public.vendor_commissions(vendor_id);
CREATE INDEX idx_vendor_commissions_status ON public.vendor_commissions(status);
CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX idx_profiles_role ON public.profiles(role); 