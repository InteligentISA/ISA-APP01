-- CRITICAL SECURITY FIX: Remove admin privilege escalation vulnerability and implement proper role-based access control

-- 1. Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 3. Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 4. Create restrictive RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can assign roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 5. Update profiles table RLS policies to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile, admins view all" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.has_role(auth.uid(), 'admin')
  );

-- Users can only update their own profile, admins can update any
CREATE POLICY "Users can update own profile, admins update any" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.has_role(auth.uid(), 'admin')
  );

-- 6. Fix database functions to include proper search_path (security)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, first_name, last_name, date_of_birth, gender, location,
    phone_number, avatar_url, company, business_type, user_type,
    status, email
  ) VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    CASE 
      WHEN new.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'date_of_birth')::date
      ELSE NULL
    END,
    new.raw_user_meta_data ->> 'gender',
    new.raw_user_meta_data ->> 'location',
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'company',
    new.raw_user_meta_data ->> 'business_type',
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'customer'),
    CASE 
      WHEN new.raw_user_meta_data ->> 'user_type' = 'vendor' THEN 'pending'
      ELSE 'approved'
    END,
    new.email
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (new.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

-- 7. Create admin-only vendor management functions
CREATE OR REPLACE FUNCTION public.approve_vendor_application(application_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Update profile status
  UPDATE public.profiles 
  SET status = 'approved', admin_notes = COALESCE(approve_vendor_application.admin_notes, profiles.admin_notes)
  WHERE id = application_id AND user_type = 'vendor';
  
  -- Add vendor role
  INSERT INTO public.user_roles (user_id, role, assigned_by) 
  VALUES (application_id, 'vendor', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_vendor_application(application_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Update profile status
  UPDATE public.profiles 
  SET status = 'rejected', admin_notes = COALESCE(reject_vendor_application.admin_notes, profiles.admin_notes)
  WHERE id = application_id AND user_type = 'vendor';
  
  RETURN TRUE;
END;
$$;

-- 8. Insert initial admin user (replace with actual admin user ID)
-- This should be done manually in production with actual admin user ID
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-admin-user-id-here', 'admin');