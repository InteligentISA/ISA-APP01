-- Manual SQL script to add rejection_reason field to profiles table
-- Run this in your Supabase SQL editor if the CLI migration doesn't work

-- Add rejection_reason field to profiles table for vendor application rejections
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.rejection_reason IS 'Reason provided by admin when rejecting a vendor application';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'rejection_reason'; 