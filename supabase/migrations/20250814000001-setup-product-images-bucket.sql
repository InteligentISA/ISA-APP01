-- Setup storage bucket for vendor application system
-- This migration ensures the required storage bucket exists and is properly configured

-- Note: Storage buckets need to be created manually in the Supabase dashboard
-- This migration provides the SQL commands to run manually if needed

-- To create the product-images bucket, run this in the Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for the product-images bucket
-- These policies allow authenticated users to upload and view files

-- Policy for uploading files (users can upload to their own folder)
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing files (public read access for product images)
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Policy for updating files (users can update their own files)
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting files (users can delete their own files)
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: If the product-images bucket doesn't exist, you'll need to create it manually
-- in the Supabase dashboard under Storage > Create a new bucket
-- Bucket name: product-images
-- Public bucket: true
-- File size limit: 50MB (or as needed)
-- Allowed MIME types: image/*, application/pdf
