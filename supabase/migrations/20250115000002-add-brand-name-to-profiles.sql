-- Add brand_name field to profiles table for vendors
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS brand_name TEXT;

