-- Approve all existing sample products so they appear in the customer dashboard
-- This migration updates products that were created before the status column was added

UPDATE public.products 
SET status = 'approved' 
WHERE status = 'pending' 
AND vendor_id IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Add a comment for documentation
COMMENT ON TABLE public.products IS 'Updated sample products to approved status for customer visibility';
