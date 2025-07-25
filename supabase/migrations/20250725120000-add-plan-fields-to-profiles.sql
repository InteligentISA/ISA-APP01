-- Add plan, plan_expiry, and chat_count fields to profiles
ALTER TABLE profiles
ADD COLUMN plan TEXT DEFAULT 'free';

ALTER TABLE profiles
ADD COLUMN plan_expiry DATE;

ALTER TABLE profiles
ADD COLUMN chat_count INTEGER DEFAULT 0; 