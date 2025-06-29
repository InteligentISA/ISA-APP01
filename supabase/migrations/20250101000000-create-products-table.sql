-- Create products table for the ecommerce catalog
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  images TEXT[], -- Array of image URLs
  main_image TEXT, -- Primary image URL
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE, -- Stock Keeping Unit
  tags TEXT[], -- Array of tags for search
  specifications JSONB, -- Product specifications as JSON
  rating DECIMAL(3,2) DEFAULT 0, -- Average rating (0-5)
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product categories table for better organization
CREATE TABLE public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Vendors can insert their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = vendor_id);

-- RLS Policies for product_categories
CREATE POLICY "Categories are viewable by everyone" ON public.product_categories
  FOR SELECT USING (true);

-- RLS Policies for product_reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update product rating when reviews change
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.products 
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.product_reviews 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.product_reviews 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update product ratings
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_product_rating();

-- Function to update updated_at timestamp for products
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to products table
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE public.update_products_updated_at();

-- Insert some default categories
INSERT INTO public.product_categories (name, description, sort_order) VALUES
  ('Electronics', 'Electronic devices and gadgets', 1),
  ('Fashion', 'Clothing, shoes, and accessories', 2),
  ('Home & Garden', 'Home improvement and garden supplies', 3),
  ('Beauty & Health', 'Beauty products and health supplies', 4),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear', 5),
  ('Books & Media', 'Books, movies, and music', 6),
  ('Toys & Games', 'Toys, games, and entertainment', 7),
  ('Automotive', 'Car parts and accessories', 8);

-- Insert some sample products
INSERT INTO public.products (name, description, price, original_price, category, brand, main_image, stock_quantity, sku, tags, specifications) VALUES
  ('iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip', 999.99, 1099.99, 'Electronics', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop', 50, 'IPHONE15PRO', ARRAY['smartphone', 'apple', 'iphone', '5g'], '{"color": "Natural Titanium", "storage": "128GB", "screen": "6.1 inch"}'),
  ('Samsung Galaxy S24', 'Premium Android smartphone with AI features', 899.99, 999.99, 'Electronics', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', 45, 'SAMSUNG-S24', ARRAY['smartphone', 'samsung', 'android', '5g'], '{"color": "Onyx Black", "storage": "256GB", "screen": "6.2 inch"}'),
  ('Nike Air Max 270', 'Comfortable running shoes with Air Max technology', 129.99, 149.99, 'Fashion', 'Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 100, 'NIKE-AM270', ARRAY['shoes', 'nike', 'running', 'sports'], '{"color": "White/Black", "size": "Available in 7-12", "material": "Mesh and synthetic"}'),
  ('MacBook Air M2', 'Ultra-thin laptop with M2 chip and all-day battery life', 1199.99, 1299.99, 'Electronics', 'Apple', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', 30, 'MACBOOK-AIR-M2', ARRAY['laptop', 'apple', 'macbook', 'm2'], '{"color": "Space Gray", "storage": "256GB", "ram": "8GB", "screen": "13.6 inch"}'),
  ('Sony WH-1000XM5', 'Premium noise-cancelling wireless headphones', 349.99, 399.99, 'Electronics', 'Sony', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 75, 'SONY-WH1000XM5', ARRAY['headphones', 'sony', 'wireless', 'noise-cancelling'], '{"color": "Black", "battery": "30 hours", "connectivity": "Bluetooth 5.2"}'),
  ('Adidas Ultraboost 22', 'High-performance running shoes with Boost technology', 179.99, 199.99, 'Fashion', 'Adidas', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', 80, 'ADIDAS-UB22', ARRAY['shoes', 'adidas', 'running', 'boost'], '{"color": "Core Black", "size": "Available in 6-13", "weight": "310g"}'),
  ('Dyson V15 Detect', 'Cord-free vacuum with laser technology', 699.99, 799.99, 'Home & Garden', 'Dyson', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', 25, 'DYSON-V15', ARRAY['vacuum', 'dyson', 'cordless', 'cleaning'], '{"color": "Nickel/Copper", "battery": "60 minutes", "weight": "2.6kg"}'),
  ('Instant Pot Duo 7-in-1', 'Multi-functional pressure cooker and slow cooker', 89.99, 119.99, 'Home & Garden', 'Instant Pot', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 60, 'INSTANT-DUO7', ARRAY['cooker', 'instant pot', 'pressure cooker', 'kitchen'], '{"capacity": "6 quarts", "color": "Stainless Steel", "programs": "7 cooking functions"}'); 