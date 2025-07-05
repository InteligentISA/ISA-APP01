-- Add vendor-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('customer', 'vendor')) DEFAULT 'customer';

-- Update the handle_new_user function to include vendor fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    location,
    phone_number,
    avatar_url,
    company,
    business_type,
    user_type
  )
  VALUES (
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
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'customer')
  );
  RETURN new;
END;
$$; 