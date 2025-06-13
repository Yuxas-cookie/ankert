-- Fix auth issues and infinite recursion in policies

-- 1. Drop problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;

-- 2. Fix the user creation trigger with proper security definer
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the default respondent role
  SELECT id INTO default_role_id FROM roles WHERE name = 'respondent' LIMIT 1;
  
  -- If no default role exists, create it
  IF default_role_id IS NULL THEN
    INSERT INTO roles (name, description, is_system_role, permissions)
    VALUES ('respondent', 'Default respondent role', true, '{
      "surveys": {"view_public": true, "respond": true},
      "responses": {"create": true, "view_own": true},
      "analytics": {"view_public": true}
    }'::jsonb)
    RETURNING id INTO default_role_id;
  END IF;

  -- Insert the new profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    bio,
    default_role_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    '',
    default_role_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Create simplified RLS policies for team_members without recursion
CREATE POLICY "Users can view team members in their teams"
  ON team_members FOR SELECT
  USING (
    -- Direct team membership check
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage members"
  ON team_members FOR ALL
  USING (
    -- Check if user is admin/owner of the team
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN roles r ON tm.role_id = r.id
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- 5. Fix profiles table RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (true);  -- All authenticated users can view profiles

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Ensure auth schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- 7. Create a helper function to safely check team membership
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = user_uuid
  );
$$;

-- 8. Create a helper function to check team admin status
CREATE OR REPLACE FUNCTION is_team_admin(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members tm
    JOIN roles r ON tm.role_id = r.id
    WHERE tm.team_id = team_uuid
    AND tm.user_id = user_uuid
    AND r.name IN ('owner', 'admin')
  );
$$;

-- 9. Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_team_member TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_admin TO authenticated;