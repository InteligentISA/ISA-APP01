-- Migration: Create user_notifications table
-- Date: 2025-01-17
-- Description: Create table to store user notifications for the notification system

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'loyalty', 'order', 'delivery', 'payment')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  action_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_category ON user_notifications(category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read ON user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created ON user_notifications(user_id, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON user_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON user_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON user_notifications;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own notifications (for testing)
CREATE POLICY "Users can insert own notifications" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON user_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert notifications for any user
CREATE POLICY "Admins can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update any notifications
CREATE POLICY "Admins can update notifications" ON user_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_notifications 
  SET is_read = true, read_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read for current user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE user_notifications 
  SET is_read = true, read_at = NOW()
  WHERE user_id = auth.uid() AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments to document the table
COMMENT ON TABLE user_notifications IS 'Stores user notifications for the notification system';
COMMENT ON COLUMN user_notifications.user_id IS 'Reference to the user who should receive this notification';
COMMENT ON COLUMN user_notifications.title IS 'Notification title';
COMMENT ON COLUMN user_notifications.message IS 'Notification message content';
COMMENT ON COLUMN user_notifications.type IS 'Notification type (info, success, warning, error)';
COMMENT ON COLUMN user_notifications.category IS 'Notification category for filtering';
COMMENT ON COLUMN user_notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN user_notifications.action_url IS 'Optional URL to navigate to when notification is clicked';
COMMENT ON COLUMN user_notifications.action_text IS 'Optional text for the action button';
COMMENT ON COLUMN user_notifications.read_at IS 'Timestamp when the notification was marked as read';
