-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin'));
    END IF;
END $$;

-- Create index on role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'profiles' 
        AND indexname = 'idx_profiles_role'
    ) THEN
        CREATE INDEX idx_profiles_role ON public.profiles(role);
    END IF;
END $$; 