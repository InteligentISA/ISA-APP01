-- Add vendor serial numbers and SKU generation

-- Add serial number to profiles for vendors
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vendor_serial_number TEXT UNIQUE;

-- Create sequence for vendor serial numbers
CREATE SEQUENCE IF NOT EXISTS public.vendor_serial_seq START 1000;

-- Function to generate vendor serial number
CREATE OR REPLACE FUNCTION public.generate_vendor_serial()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  serial_num TEXT;
BEGIN
  serial_num := 'V' || LPAD(nextval('public.vendor_serial_seq')::TEXT, 6, '0');
  RETURN serial_num;
END;
$$;

-- Trigger to auto-assign vendor serial on vendor signup
CREATE OR REPLACE FUNCTION public.assign_vendor_serial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_type = 'vendor' AND NEW.vendor_serial_number IS NULL THEN
    NEW.vendor_serial_number := public.generate_vendor_serial();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_vendor_serial_trigger ON public.profiles;
CREATE TRIGGER assign_vendor_serial_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_vendor_serial();

-- Function to generate SKU based on product details
CREATE OR REPLACE FUNCTION public.generate_product_sku(
  p_brand TEXT,
  p_category TEXT,
  p_main_image TEXT,
  p_vendor_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  brand_code TEXT;
  category_code TEXT;
  random_code TEXT;
  vendor_serial TEXT;
  final_sku TEXT;
BEGIN
  -- Get vendor serial number
  SELECT vendor_serial_number INTO vendor_serial
  FROM public.profiles
  WHERE id = p_vendor_id;
  
  -- Generate brand code (first 2 letters uppercase)
  brand_code := UPPER(SUBSTRING(COALESCE(p_brand, 'GN'), 1, 2));
  
  -- Generate category code (first 3 letters uppercase)
  category_code := UPPER(SUBSTRING(COALESCE(p_category, 'GEN'), 1, 3));
  
  -- Generate random 4-character code
  random_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
  
  -- Combine: BRAND-CAT-RAND-(VENDOR_SERIAL)
  final_sku := brand_code || '-' || category_code || '-' || random_code || '-' || COALESCE(vendor_serial, 'V000000');
  
  RETURN final_sku;
END;
$$;

-- Trigger to auto-generate SKU on product insert
CREATE OR REPLACE FUNCTION public.auto_generate_sku()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := public.generate_product_sku(
      NEW.brand,
      NEW.category,
      NEW.main_image,
      NEW.vendor_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_generate_sku_trigger ON public.products;
CREATE TRIGGER auto_generate_sku_trigger
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_sku();

-- Create index on SKU for fast searching
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Update existing vendors with serial numbers
DO $$
DECLARE
  vendor_record RECORD;
BEGIN
  FOR vendor_record IN 
    SELECT id FROM public.profiles 
    WHERE user_type = 'vendor' AND vendor_serial_number IS NULL
  LOOP
    UPDATE public.profiles
    SET vendor_serial_number = public.generate_vendor_serial()
    WHERE id = vendor_record.id;
  END LOOP;
END $$;
