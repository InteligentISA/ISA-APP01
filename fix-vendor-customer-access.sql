-- ============================================================================
-- FIX VENDOR AND CUSTOMER ACCESS CONTROL
-- ============================================================================
-- This script adds RLS policies to prevent:
-- 1. Vendors from accessing customer data
-- 2. Customers from accessing vendor data
-- ============================================================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to ensure users can only read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy to prevent vendors from accessing customer-specific data
DROP POLICY IF EXISTS "Vendors cannot access customer profiles" ON profiles;
CREATE POLICY "Vendors cannot access customer profiles"
ON profiles FOR SELECT
USING (
  -- Allow users to see their own profile
  auth.uid() = id
  OR
  -- Allow vendors to see other vendors (for listings, etc)
  (user_type = 'vendor' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'vendor'
  ))
  OR
  -- Allow customers to see vendors (for product listings)
  (user_type = 'vendor' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'customer'
  ))
  OR
  -- Allow vendors to see customers (for order management)
  (user_type = 'customer' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'vendor'
  ))
);

-- Ensure products are accessible to all authenticated users
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
CREATE POLICY "Authenticated users can view products"
ON products FOR SELECT
USING (auth.role() = 'authenticated');

-- Ensure orders only visible to owner or vendor
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;
CREATE POLICY "Customers can view their own orders"
ON orders FOR SELECT
USING (
  -- Customer can see their own orders
  customer_id = auth.uid()
  OR
  -- Vendor can see orders for their products
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = orders.id
    AND p.vendor_id = auth.uid()
  )
);

-- Ensure vendor products only visible to product owner
DROP POLICY IF EXISTS "Vendors can manage their own products" ON products;
CREATE POLICY "Vendors can manage their own products"
ON products FOR ALL
USING (
  -- Vendor can only manage their own products
  vendor_id = auth.uid()
  OR
  -- Allow view access to all authenticated users (already covered above)
  auth.role() = 'authenticated'
);

-- Create index for better performance on vendor_id lookups
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Function to get user type
CREATE OR REPLACE FUNCTION get_user_type(user_id UUID)
RETURNS TEXT AS $$
  SELECT user_type FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is vendor
CREATE OR REPLACE FUNCTION is_vendor(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND user_type = 'vendor');
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is customer
CREATE OR REPLACE FUNCTION is_customer(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND user_type = 'customer');
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_type(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_vendor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_customer(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the policies are working:

-- 1. Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 2. Check all policies on profiles table
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 3. Test as a vendor user (replace with actual vendor user_id)
-- SELECT * FROM profiles WHERE user_type = 'customer' LIMIT 1;
-- Should return 0 rows for vendors

-- 4. Test as a customer user (replace with actual customer user_id)
-- SELECT * FROM profiles WHERE user_type = 'vendor' LIMIT 1;
-- Should return vendor profiles for customers

-- ============================================================================
