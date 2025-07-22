-- Add tax_id and company_website fields to profiles table for vendors
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT; 