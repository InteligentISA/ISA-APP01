-- Create table for tracking Jumia product interactions
CREATE TABLE public.jumia_product_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  jumia_product_id TEXT NOT NULL, -- The unique identifier from Jumia
  jumia_product_name TEXT NOT NULL,
  jumia_product_price DECIMAL(10,2) NOT NULL,
  jumia_product_link TEXT NOT NULL,
  jumia_product_image TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'unlike', 'view', 'add_to_cart', 'click')),
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jumia_interactions_user_id ON public.jumia_product_interactions(user_id);
CREATE INDEX idx_jumia_interactions_product_id ON public.jumia_product_interactions(jumia_product_id);
CREATE INDEX idx_jumia_interactions_type ON public.jumia_product_interactions(interaction_type);
CREATE INDEX idx_jumia_interactions_created_at ON public.jumia_product_interactions(created_at);
CREATE INDEX idx_jumia_interactions_user_product ON public.jumia_product_interactions(user_id, jumia_product_id);

-- Enable Row Level Security
ALTER TABLE public.jumia_product_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own Jumia interactions" ON public.jumia_product_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Jumia interactions" ON public.jumia_product_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Jumia interactions" ON public.jumia_product_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Jumia interactions" ON public.jumia_product_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate likes for the same user and product
CREATE UNIQUE INDEX idx_jumia_unique_like ON public.jumia_product_interactions(user_id, jumia_product_id, interaction_type) 
WHERE interaction_type = 'like'; 