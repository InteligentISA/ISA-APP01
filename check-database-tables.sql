-- Check if all required tables exist
-- Run this in your Supabase SQL editor to verify database setup

-- Check if products table exists
SELECT 
  'products' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) as exists
UNION ALL
-- Check if orders table exists
SELECT 
  'orders' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'orders'
  ) as exists
UNION ALL
-- Check if order_items table exists
SELECT 
  'order_items' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items'
  ) as exists
UNION ALL
-- Check if profiles table exists
SELECT 
  'profiles' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) as exists;

-- Check products table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Check if there are any products in the database
SELECT COUNT(*) as total_products FROM public.products;

-- Check if there are any vendor profiles
SELECT COUNT(*) as total_vendors 
FROM public.profiles 
WHERE user_type = 'vendor' OR role = 'vendor'; 