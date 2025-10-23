-- Create shared_content table for sharing functionality
CREATE TABLE IF NOT EXISTS shared_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('product', 'wishlist', 'cart', 'conversation')),
  content_id TEXT NOT NULL,
  share_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'base64'),
  metadata JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_content_share_code ON shared_content(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_content_user_id ON shared_content(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_content_content_type ON shared_content(content_type);

-- Enable RLS
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_content
CREATE POLICY "Users can view their own shared content" ON shared_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shared content" ON shared_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared content" ON shared_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared content" ON shared_content
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public access to shared content by share_code (for viewing shared links)
CREATE POLICY "Public can view shared content by share_code" ON shared_content
  FOR SELECT USING (true);

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := replace(replace(encode(gen_random_bytes(16), 'base64'), '+', '-'), '/', '_');
    SELECT EXISTS(SELECT 1 FROM shared_content WHERE share_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update the default value to use the function
ALTER TABLE shared_content ALTER COLUMN share_code SET DEFAULT generate_share_code();
