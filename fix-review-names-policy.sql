-- Fix RLS policy to allow viewing user names in product reviews
-- This policy allows authenticated users to view basic profile information (first_name, last_name) 
-- for users who have written product reviews, so that review names can be displayed properly

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile, admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile, admins view all, public can view review names" ON public.profiles;

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

-- Also ensure the product_reviews table has proper RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for product_reviews to allow reading reviews
DROP POLICY IF EXISTS "Anyone can read product reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read product reviews" ON public.product_reviews
  FOR SELECT USING (true);

-- Create policy for product_reviews to allow authenticated users to insert reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for product_reviews to allow users to update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for product_reviews to allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.product_reviews;
CREATE POLICY "Users can delete own reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);
