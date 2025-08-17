-- Add status and rejection_reason fields to products table for approval workflow
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.products.status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN public.products.rejection_reason IS 'Reason provided by admin when rejecting a product';
