-- Fix the share_code column to use base64 instead of base64url
-- First, drop the existing default function if it exists
DROP FUNCTION IF EXISTS generate_share_code();

-- Update the column default to use base64 encoding with URL-safe characters
ALTER TABLE shared_content ALTER COLUMN share_code SET DEFAULT replace(replace(encode(gen_random_bytes(16), 'base64'), '+', '-'), '/', '_');

-- Create a new function to generate unique share codes
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
