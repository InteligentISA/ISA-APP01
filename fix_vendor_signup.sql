-- Fix for vendor signup issue
-- This script will fix the handle_new_user function and update existing profiles

-- 1. Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create a corrected handle_new_user function
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
    user_type,
    status,
    email
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
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'customer'),
    CASE 
      WHEN new.raw_user_meta_data ->> 'user_type' = 'vendor' THEN 'pending'
      ELSE 'approved'
    END,
    new.email
  );
  RETURN new;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Fix existing profiles that should be vendors
UPDATE profiles 
SET 
  user_type = 'vendor',
  status = 'pending',
  email = 'vendor@example.com' -- You'll need to update this with actual emails
WHERE id IN (
  '5609d1dd-8152-41bf-883f-fed8f857afd4',
  'fd0c88c3-ffb9-4bf6-9ceb-3f9f487cb055',
  '93f19168-c2b2-4602-b26a-51a16349fabc',
  'ba086739-b962-4467-88c5-08173a4e7226',
  '626611b0-c6e1-4227-a105-dc61751a7b80'
)
AND user_type IS NULL;

-- 5. Verify the fix
SELECT 
  id,
  first_name,
  last_name,
  email,
  user_type,
  status,
  company,
  business_type,
  phone_number,
  created_at
FROM profiles
WHERE user_type = 'vendor'
ORDER BY created_at DESC; 