-- Create customer behavior tracking tables
-- This will help analyze user preferences and improve product recommendations

-- Create user_product_interactions table to track all user-product interactions
CREATE TABLE public.user_product_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'add_to_cart', 'purchase', 'review', 'share')),
  interaction_data JSONB, -- Additional data like view duration, rating, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  INDEX idx_user_product_interactions_user_id (user_id),
  INDEX idx_user_product_interactions_product_id (product_id),
  INDEX idx_user_product_interactions_type (interaction_type),
  INDEX idx_user_product_interactions_created_at (created_at)
);

-- Create user_preferences table to store calculated user preferences
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  preference_score DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (preference_score >= 0 AND preference_score <= 1),
  interaction_count INTEGER NOT NULL DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference per user per category
  UNIQUE(user_id, category)
);

-- Create product_popularity table to track product performance metrics
CREATE TABLE public.product_popularity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  cart_add_count INTEGER NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  revenue_generated DECIMAL(10,2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5,4) NOT NULL DEFAULT 0, -- purchases / views
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per product
  UNIQUE(product_id)
);

-- Create user_recommendations table to store personalized product recommendations
CREATE TABLE public.user_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  recommendation_score DECIMAL(5,4) NOT NULL DEFAULT 0 CHECK (recommendation_score >= 0 AND recommendation_score <= 1),
  recommendation_reason TEXT, -- e.g., "Based on your interest in Electronics"
  is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Ensure one recommendation per user per product
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_popularity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_product_interactions
CREATE POLICY "Users can view their own interactions" ON public.user_product_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" ON public.user_product_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vendors can view interactions for their products (anonymized)
CREATE POLICY "Vendors can view interactions for their products" ON public.user_product_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = user_product_interactions.product_id AND p.vendor_id = auth.uid()
    )
  );

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for product_popularity (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view product popularity" ON public.product_popularity
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for user_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.user_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.user_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_product_interactions_user_id ON public.user_product_interactions(user_id);
CREATE INDEX idx_user_product_interactions_product_id ON public.user_product_interactions(product_id);
CREATE INDEX idx_user_product_interactions_type ON public.user_product_interactions(interaction_type);
CREATE INDEX idx_user_product_interactions_created_at ON public.user_product_interactions(created_at);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_category ON public.user_preferences(category);

CREATE INDEX idx_product_popularity_product_id ON public.product_popularity(product_id);
CREATE INDEX idx_product_popularity_conversion_rate ON public.product_popularity(conversion_rate);

CREATE INDEX idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_score ON public.user_recommendations(recommendation_score);
CREATE INDEX idx_user_recommendations_expires_at ON public.user_recommendations(expires_at);

-- Create function to update product popularity when interactions occur
CREATE OR REPLACE FUNCTION public.update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update product popularity record
  INSERT INTO public.product_popularity (product_id, view_count, like_count, cart_add_count, purchase_count)
  VALUES (
    NEW.product_id,
    CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'add_to_cart' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'purchase' THEN 1 ELSE 0 END
  )
  ON CONFLICT (product_id) DO UPDATE SET
    view_count = product_popularity.view_count + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    like_count = product_popularity.like_count + CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
    cart_add_count = product_popularity.cart_add_count + CASE WHEN NEW.interaction_type = 'add_to_cart' THEN 1 ELSE 0 END,
    purchase_count = product_popularity.purchase_count + CASE WHEN NEW.interaction_type = 'purchase' THEN 1 ELSE 0 END,
    conversion_rate = CASE 
      WHEN (product_popularity.view_count + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END) > 0 
      THEN (product_popularity.purchase_count + CASE WHEN NEW.interaction_type = 'purchase' THEN 1 ELSE 0 END)::DECIMAL / 
           (product_popularity.view_count + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END)::DECIMAL
      ELSE 0 
    END,
    last_updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update product popularity
CREATE TRIGGER update_product_popularity_trigger
  AFTER INSERT ON public.user_product_interactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_product_popularity();

-- Create function to update user preferences when interactions occur
CREATE OR REPLACE FUNCTION public.update_user_preferences()
RETURNS TRIGGER AS $$
DECLARE
  product_category TEXT;
  interaction_weight DECIMAL(3,2);
BEGIN
  -- Get product category
  SELECT category INTO product_category 
  FROM public.products 
  WHERE id = NEW.product_id;
  
  -- Set interaction weight based on type
  CASE NEW.interaction_type
    WHEN 'view' THEN interaction_weight := 0.1;
    WHEN 'like' THEN interaction_weight := 0.3;
    WHEN 'add_to_cart' THEN interaction_weight := 0.5;
    WHEN 'purchase' THEN interaction_weight := 1.0;
    WHEN 'review' THEN interaction_weight := 0.4;
    ELSE interaction_weight := 0.1;
  END CASE;
  
  -- Insert or update user preference
  INSERT INTO public.user_preferences (user_id, category, preference_score, interaction_count)
  VALUES (NEW.user_id, product_category, interaction_weight, 1)
  ON CONFLICT (user_id, category) DO UPDATE SET
    preference_score = LEAST(1.0, user_preferences.preference_score + interaction_weight),
    interaction_count = user_preferences.interaction_count + 1,
    last_interaction_at = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update user preferences
CREATE TRIGGER update_user_preferences_trigger
  AFTER INSERT ON public.user_product_interactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_preferences(); 