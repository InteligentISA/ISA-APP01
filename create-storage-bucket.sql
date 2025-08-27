-- Create the product-images storage bucket
-- Run this in the Supabase SQL editor

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the product-images bucket
-- These policies allow authenticated users to upload and view files

-- Policy for uploading files (users can upload to their own folder)
CREATE POLICY IF NOT EXISTS "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing files (public read access for product images)
CREATE POLICY IF NOT EXISTS "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Policy for updating files (users can update their own files)
CREATE POLICY IF NOT EXISTS "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting files (users can delete their own files)
CREATE POLICY IF NOT EXISTS "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 