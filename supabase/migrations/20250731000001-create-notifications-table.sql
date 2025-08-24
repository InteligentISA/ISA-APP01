-- Create notifications table for vendor and user notifications

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_name TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = vendor_id);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_vendor_id ON public.notifications(vendor_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID DEFAULT NULL,
  p_vendor_id UUID DEFAULT NULL,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_product_name TEXT DEFAULT NULL,
  p_product_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    vendor_id,
    type,
    title,
    message,
    product_name,
    product_id
  ) VALUES (
    p_user_id,
    p_vendor_id,
    p_type,
    p_title,
    p_message,
    p_product_name,
    p_product_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;
