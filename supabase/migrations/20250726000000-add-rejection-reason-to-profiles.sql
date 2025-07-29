-- Add rejection_reason field to profiles table for vendor application rejections
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.rejection_reason IS 'Reason provided by admin when rejecting a vendor application'; 