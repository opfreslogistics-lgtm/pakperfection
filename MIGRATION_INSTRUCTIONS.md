# Migration Instructions for Menu Items

## Issues Fixed
1. The `short_description` column is missing from the `menu_items` table, causing errors when saving menu items.
2. The `price_modifier` column in `modifier_options` may have a naming conflict (both `price` and `price_modifier` existing).

## Solution

### Step 1: Run the Migration

You need to run the migration file `supabase/migrations/007_add_short_description_to_menu_items.sql` in your Supabase database.

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/007_add_short_description_to_menu_items.sql`
5. Click **Run** to execute the migration

#### Option B: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify the Migration

After running the migration, verify that the column was added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name = 'short_description';
```

You should see a row with `short_description` and `text` as the data type.

## What the Migration Does

1. **Adds `short_description` column** to `menu_items` table
   - This is used for the "Primary Customization Summary" (e.g., "Choose Goat or Beef")
   
2. **Adds `description_override` column** to `menu_upsells` table
   - This allows custom descriptions for upsell items
   
3. **Fixes `price_modifier` column** in `modifier_options` table
   - Handles case where both `price` and `price_modifier` exist (drops old `price` column)
   - Or renames `price` to `price_modifier` if only `price` exists
   - Or creates `price_modifier` column if neither exists
   - Ensures the column has the correct data type (DECIMAL)

## Temporary Workaround

The code has been updated to handle the missing column gracefully:
- If the column doesn't exist, it will save the item without `short_description`
- You'll see a warning toast message prompting you to run the migration
- Once the migration is run, `short_description` will work normally

## After Migration

Once you've run the migration:
1. Refresh your admin panel
2. Try saving a menu item again
3. The `short_description` field should now work without errors

