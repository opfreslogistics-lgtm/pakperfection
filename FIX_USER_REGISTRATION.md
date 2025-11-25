# Fix for "Database error saving new user"

If you're getting this error when trying to register a user, follow these steps:

## Quick Fix

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the following SQL** (copy from `supabase/migrations/002_fix_user_trigger.sql`):

```sql
-- Fix user creation trigger
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
```

## Alternative: Manual Profile Creation

If the trigger still doesn't work, you can manually create profiles. After a user signs up:

1. Go to **Authentication** > **Users** in Supabase
2. Find the new user
3. Go to **SQL Editor** and run:

```sql
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users
INSERT INTO public.profiles (id, name, email, role)
SELECT 
  id,
  raw_user_meta_data->>'name' as name,
  email,
  CASE WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN 'admin' ELSE 'user' END as role
FROM auth.users
WHERE id = 'USER_ID_HERE'
ON CONFLICT (id) DO NOTHING;
```

## Check if Profiles Table Exists

Run this to verify:

```sql
SELECT * FROM public.profiles LIMIT 1;
```

If you get an error, the table doesn't exist. Run the full migration from `001_initial_schema.sql`.

## Check Trigger Status

Run this to see if the trigger exists:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## Common Issues

1. **Table doesn't exist**: Run the full migration
2. **Permissions issue**: The function needs SECURITY DEFINER
3. **RLS blocking**: The function should bypass RLS, but check policies
4. **Trigger not firing**: Verify trigger exists and is active

## Test the Fix

After running the fix:

1. Try registering a new user
2. Check the `profiles` table to see if a row was created
3. Verify the first user has `role = 'admin'`





