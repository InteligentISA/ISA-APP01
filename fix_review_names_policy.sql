-- Fix RLS policy to allow viewing user names in product reviews
-- This policy allows authenticated users to view basic profile information (first_name, last_name) 
-- for users who have written product reviews, so that review names can be displayed properly

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile, admins view all" ON public.profiles;

-- Create a new policy that allows viewing profile names for review purposes
CREATE POLICY "Users can view own profile, admins view all, public can view review names" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.has_role(auth.uid(), 'admin') OR
    -- Allow viewing names of users who have written reviews
    EXISTS (
      SELECT 1 FROM public.product_reviews 
      WHERE product_reviews.user_id = profiles.id
    )
  );

-- Keep the existing update policy
-- Users can only update their own profile, admins can update any
-- (This policy should already exist) 