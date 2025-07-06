-- Add M-Pesa support to payments table
-- Update the payment_method check constraint to include 'mpesa'

-- First, drop the existing check constraint
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

-- Add the new check constraint with M-Pesa support
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_method_check 
  CHECK (payment_method IN ('stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash_on_delivery', 'cash_on_pickup', 'mpesa'));

-- Add M-Pesa specific fields
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS mpesa_phone_number TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS mpesa_transaction_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id TEXT;

-- Add admin policy for viewing all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Add admin policy for viewing all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Add admin policy for viewing all order items
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  ); 