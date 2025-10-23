-- Create order_messages table for customer-vendor communication
CREATE TABLE IF NOT EXISTS public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'vendor')),
  message_text TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_sender_id ON public.order_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_created_at ON public.order_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_messages
-- Users can view messages for orders they are involved in
CREATE POLICY "Users can view order messages they are involved in"
ON public.order_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_messages.order_id
    AND (
      o.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.order_items oi
        WHERE oi.order_id = o.id
        AND oi.vendor_id = auth.uid()
      )
    )
  )
);

-- Users can insert messages for orders they are involved in
CREATE POLICY "Users can insert order messages they are involved in"
ON public.order_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_messages.order_id
    AND (
      o.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.order_items oi
        WHERE oi.order_id = o.id
        AND oi.vendor_id = auth.uid()
      )
    )
  )
  AND sender_id = auth.uid()
);

-- Admins can view all order messages
CREATE POLICY "Admins can view all order messages"
ON public.order_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() 
    AND role IN ('main_admin', 'order_admin', 'customer_support')
    AND is_active = true
  )
);
