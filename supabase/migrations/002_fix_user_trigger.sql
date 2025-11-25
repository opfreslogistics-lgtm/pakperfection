-- Fix user creation trigger
-- This ensures the trigger function has proper permissions

-- Drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert profile with role based on count
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT INSERT ON public.profiles TO postgres, service_role;

-- Ensure RLS allows the function to insert
-- The function uses SECURITY DEFINER so it bypasses RLS, but we need to ensure the table allows it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add a policy that allows the function to insert (though SECURITY DEFINER should bypass this)
-- This is a safety measure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Allow trigger function to insert'
  ) THEN
    CREATE POLICY "Allow trigger function to insert" ON public.profiles
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;





