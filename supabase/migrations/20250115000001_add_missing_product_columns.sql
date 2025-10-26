-- Add all missing product columns for comprehensive product management

-- Add brand level column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand_level TEXT;

-- Add main category and sub-subcategory columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS main_category TEXT,
ADD COLUMN IF NOT EXISTS sub_subcategory TEXT;

-- Add commission percentage column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Add pickup location details
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS pickup_county TEXT,
ADD COLUMN IF NOT EXISTS pickup_constituency TEXT,
ADD COLUMN IF NOT EXISTS pickup_ward TEXT;

-- Add return policy columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS return_eligible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS return_policy_guidelines TEXT,
ADD COLUMN IF NOT EXISTS return_policy_reason TEXT;

-- Add product dimensions and weight
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS length_cm DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS width_cm DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(8,2);

-- Add warranty information
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS warranty_period INTEGER,
ADD COLUMN IF NOT EXISTS warranty_unit TEXT CHECK (warranty_unit IN ('days', 'weeks', 'months', 'years')),
ADD COLUMN IF NOT EXISTS has_warranty BOOLEAN DEFAULT false;

-- Add delivery methods (as JSONB array)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS delivery_methods JSONB DEFAULT '[]'::jsonb;

-- Add materials (as JSONB array)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

-- Add extended electronics specifications
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS display_resolution TEXT,
ADD COLUMN IF NOT EXISTS display_size_inch DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hdd_size TEXT,
ADD COLUMN IF NOT EXISTS memory_capacity_gb INTEGER,
ADD COLUMN IF NOT EXISTS system_memory TEXT,
ADD COLUMN IF NOT EXISTS storage_capacity_gb INTEGER,
ADD COLUMN IF NOT EXISTS battery_capacity_mah INTEGER,
ADD COLUMN IF NOT EXISTS cpu_manufacturer TEXT,
ADD COLUMN IF NOT EXISTS processor_type TEXT,
ADD COLUMN IF NOT EXISTS graphics_memory_gb INTEGER,
ADD COLUMN IF NOT EXISTS memory_technology TEXT,
ADD COLUMN IF NOT EXISTS panel_type TEXT,
ADD COLUMN IF NOT EXISTS plug_type TEXT,
ADD COLUMN IF NOT EXISTS voltage TEXT,
ADD COLUMN IF NOT EXISTS mount_type TEXT,
ADD COLUMN IF NOT EXISTS modem_type TEXT,
ADD COLUMN IF NOT EXISTS connection_gender TEXT;

-- Add location columns for geolocation
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.products.brand_level IS 'Brand tier level (premium, mid-range, budget)';
COMMENT ON COLUMN public.products.main_category IS 'Primary product category';
COMMENT ON COLUMN public.products.sub_subcategory IS 'Third level category classification';
COMMENT ON COLUMN public.products.commission_percentage IS 'Commission percentage for vendor';
COMMENT ON COLUMN public.products.pickup_county IS 'County for pickup location';
COMMENT ON COLUMN public.products.pickup_constituency IS 'Constituency for pickup location';
COMMENT ON COLUMN public.products.pickup_ward IS 'Ward for pickup location';
COMMENT ON COLUMN public.products.return_eligible IS 'Whether product is eligible for returns';
COMMENT ON COLUMN public.products.return_policy_guidelines IS 'Guidelines for product returns';
COMMENT ON COLUMN public.products.return_policy_reason IS 'Reason if product is not returnable';
COMMENT ON COLUMN public.products.weight_kg IS 'Product weight in kilograms';
COMMENT ON COLUMN public.products.length_cm IS 'Product length in centimeters';
COMMENT ON COLUMN public.products.width_cm IS 'Product width in centimeters';
COMMENT ON COLUMN public.products.height_cm IS 'Product height in centimeters';
COMMENT ON COLUMN public.products.warranty_period IS 'Warranty duration';
COMMENT ON COLUMN public.products.warranty_unit IS 'Warranty time unit (days, weeks, months, years)';
COMMENT ON COLUMN public.products.has_warranty IS 'Whether product has warranty';
COMMENT ON COLUMN public.products.delivery_methods IS 'Available delivery methods as JSON array';
COMMENT ON COLUMN public.products.materials IS 'Product materials as JSON array';
COMMENT ON COLUMN public.products.display_resolution IS 'Display resolution for electronics';
COMMENT ON COLUMN public.products.display_size_inch IS 'Display size in inches';
COMMENT ON COLUMN public.products.hdd_size IS 'Hard disk drive size';
COMMENT ON COLUMN public.products.memory_capacity_gb IS 'Memory capacity in GB';
COMMENT ON COLUMN public.products.system_memory IS 'System memory type';
COMMENT ON COLUMN public.products.storage_capacity_gb IS 'Storage capacity in GB';
COMMENT ON COLUMN public.products.battery_capacity_mah IS 'Battery capacity in mAh';
COMMENT ON COLUMN public.products.cpu_manufacturer IS 'CPU manufacturer';
COMMENT ON COLUMN public.products.processor_type IS 'Processor type';
COMMENT ON COLUMN public.products.graphics_memory_gb IS 'Graphics memory in GB';
COMMENT ON COLUMN public.products.memory_technology IS 'Memory technology type';
COMMENT ON COLUMN public.products.panel_type IS 'Display panel type';
COMMENT ON COLUMN public.products.plug_type IS 'Plug type for electronics';
COMMENT ON COLUMN public.products.voltage IS 'Voltage specification';
COMMENT ON COLUMN public.products.mount_type IS 'Mount type for electronics';
COMMENT ON COLUMN public.products.modem_type IS 'Modem type for electronics';
COMMENT ON COLUMN public.products.connection_gender IS 'Connection gender type';
COMMENT ON COLUMN public.products.location_lat IS 'Product location latitude';
COMMENT ON COLUMN public.products.location_lng IS 'Product location longitude';
COMMENT ON COLUMN public.products.location_address IS 'Product location address';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_main_category ON public.products(main_category);
CREATE INDEX IF NOT EXISTS idx_products_sub_subcategory ON public.products(sub_subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand_level ON public.products(brand_level);
CREATE INDEX IF NOT EXISTS idx_products_return_eligible ON public.products(return_eligible);
CREATE INDEX IF NOT EXISTS idx_products_has_warranty ON public.products(has_warranty);
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products(location_lat, location_lng);

-- Update the SKU generation trigger to use main_category instead of category
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
      COALESCE(NEW.main_category, NEW.category),
      NEW.main_image,
      NEW.vendor_id
    );
  END IF;
  RETURN NEW;
END;
$$;
