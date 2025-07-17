-- Fix storage bucket RLS policies for product-images
-- Run this in your Supabase SQL editor

-- First, let's check if the bucket exists and create it if it doesn't
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  524288, -- 512KB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;

-- Create new, simpler policies that work better
-- Policy 1: Allow authenticated users to upload to product-images bucket
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy 2: Allow public read access to product-images bucket
CREATE POLICY "Allow public read access to product images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images'
  );

-- Policy 3: Allow authenticated users to update files in product-images bucket
CREATE POLICY "Allow users to update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy 4: Allow authenticated users to delete files in product-images bucket
CREATE POLICY "Allow users to delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Make sure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 