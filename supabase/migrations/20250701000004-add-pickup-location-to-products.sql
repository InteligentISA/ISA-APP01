-- Add pickup location and phone number fields to products table
ALTER TABLE public.products 
ADD COLUMN pickup_location TEXT,
ADD COLUMN pickup_phone_number TEXT;

-- Add comment to explain the new fields
COMMENT ON COLUMN public.products.pickup_location IS 'Address or location details where customers can pickup the item from vendor';
COMMENT ON COLUMN public.products.pickup_phone_number IS 'Phone number customers can call for pickup inquiries'; 