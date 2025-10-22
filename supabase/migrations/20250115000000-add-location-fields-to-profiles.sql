-- Add separate location fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS constituency TEXT,
ADD COLUMN IF NOT EXISTS ward TEXT;

-- Update the handle_new_user function to include location fields
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
    status, email, county, constituency, ward
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
    new.email,
    new.raw_user_meta_data ->> 'county',
    new.raw_user_meta_data ->> 'constituency',
    new.raw_user_meta_data ->> 'ward'
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (new.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;


