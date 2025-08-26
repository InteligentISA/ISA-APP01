-- Create notification_tokens table for storing FCM tokens
CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_token ON notification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_active ON notification_tokens(is_active);

-- Enable RLS
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification tokens" ON notification_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification tokens" ON notification_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification tokens" ON notification_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification tokens" ON notification_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notification_tokens_updated_at
  BEFORE UPDATE ON notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_tokens_updated_at();
