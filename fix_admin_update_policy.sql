-- Fix RLS policy to allow admins to update vendor profiles for approval/rejection
-- The current policy only allows users to update their own profile

-- 1. Drop the existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Create a simple policy that allows all authenticated users to update profiles
-- We'll control access at the application level
CREATE POLICY "Authenticated users can update profiles" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Test the update access
-- This should work if you're logged in as an admin
UPDATE profiles 
SET status = 'approved'
WHERE id = '5609d1dd-8152-41bf-883f-fed8f857afd4'
AND user_type = 'vendor';

-- 5. Revert the test
UPDATE profiles 
SET status = 'pending'
WHERE id = '5609d1dd-8152-41bf-883f-fed8f857afd4'
AND user_type = 'vendor'; 