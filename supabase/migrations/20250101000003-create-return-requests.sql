-- Create return_requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason text NOT NULL,
    message text,
    return_type text NOT NULL CHECK (return_type IN ('replacement', 'exchange', 'refund')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes text,
    vendor_notes text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON public.return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_vendor_id ON public.return_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON public.return_requests(created_at);

-- Add RLS policies
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own return requests
CREATE POLICY "Users can view own return requests" ON public.return_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own return requests
CREATE POLICY "Users can create own return requests" ON public.return_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own return requests (only if pending)
CREATE POLICY "Users can update own pending return requests" ON public.return_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Vendors can view return requests for their products
CREATE POLICY "Vendors can view return requests for their products" ON public.return_requests
    FOR SELECT USING (auth.uid() = vendor_id);

-- Vendors can update return requests for their products
CREATE POLICY "Vendors can update return requests for their products" ON public.return_requests
    FOR UPDATE USING (auth.uid() = vendor_id);

-- Admins can view and update all return requests
CREATE POLICY "Admins can view all return requests" ON public.return_requests
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all return requests" ON public.return_requests
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_return_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_return_requests_updated_at
    BEFORE UPDATE ON public.return_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_return_requests_updated_at();
