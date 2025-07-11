-- Add status field to profiles table for vendor approval workflow
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved';

-- Set existing vendors to approved status
UPDATE public.profiles 
SET status = 'approved' 
WHERE user_type = 'vendor' AND status IS NULL;

-- Set existing customers to approved status
UPDATE public.profiles 
SET status = 'approved' 
WHERE user_type = 'customer' AND status IS NULL; 