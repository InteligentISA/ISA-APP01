-- Run this SQL in your Supabase SQL Editor to fix existing share codes

-- Fix existing share codes to be URL-safe by removing padding characters
UPDATE shared_content 
SET share_code = replace(replace(replace(share_code, '+', '-'), '/', '_'), '=', '')
WHERE share_code LIKE '%=%' OR share_code LIKE '%+%' OR share_code LIKE '%/%';

-- Update the function to generate URL-safe codes without padding
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate base64 and make it URL-safe by removing padding and replacing special chars
    new_code := replace(replace(replace(encode(gen_random_bytes(16), 'base64'), '+', '-'), '/', '_'), '=', '');
    SELECT EXISTS(SELECT 1 FROM shared_content WHERE share_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update the default value to use the function
ALTER TABLE shared_content ALTER COLUMN share_code SET DEFAULT generate_share_code();

