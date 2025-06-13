-- Fix auth trigger permissions to prevent 500 errors

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile record (without username field as it doesn't exist in the table)
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();

    -- Create default role assignment
    INSERT INTO public.team_members (
        user_id,
        team_id,
        role_id,
        created_at
    )
    SELECT 
        NEW.id,
        (SELECT id FROM teams WHERE name = 'Default Team' LIMIT 1),
        (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
        NOW()
    WHERE EXISTS (SELECT 1 FROM teams WHERE name = 'Default Team')
    AND EXISTS (SELECT 1 FROM roles WHERE name = 'member')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the security definer
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user creation with proper permissions using SECURITY DEFINER to avoid auth permission errors';

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function is owned by postgres user for proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Verify existing users have profiles
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
    id, 
    email, 
    created_at,
    NOW() as updated_at
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);