# Fix Menu Items Columns Issue

## Problem
You're getting the error: **"Could not find the 'availability_schedule' column of 'menu_items' in the schema cache"**

This happens because your database is missing several advanced columns that the menu management form is trying to use.

## Solution

### Option 1: Run the SQL Script (Recommended - Fastest)

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   
2. **Navigate to the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Fix Script**
   - Open the file `FIX_MENU_ITEMS_COLUMNS.sql` from your project root
   - Copy all the contents
   - Paste it into the Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)

4. **Verify Success**
   - At the bottom of the results, you should see a list of all the columns that were added
   - You should see a success message
   - The query should complete without errors

5. **Test Your Menu**
   - Go back to your admin menu page
   - Try adding or editing a menu item
   - It should now work without errors!

### Option 2: Run Individual Migrations

If you prefer to run migrations in order:

1. **Check which migrations have been run**
   ```sql
   SELECT * FROM schema_migrations ORDER BY version;
   ```

2. **Run migration 022**
   - The file is located at: `supabase/migrations/022_add_advanced_menu_fields.sql`
   - Copy and run it in the SQL Editor

## What This Fix Does

The script adds the following advanced fields to your `menu_items` table:

### Promo Pricing
- `promo_price` - Special promotional price
- `promo_active` - Whether the promo is active

### Variants & Ingredients
- `variants` - JSON array of size/variant options
- `ingredients` - Array of ingredients
- `allergen_flags` - Array of allergen warnings

### Logistics & Operations
- `inventory_linked` - Whether item tracks inventory
- `current_stock` - Current stock quantity
- `low_stock_threshold` - When to show low stock warning
- `prep_time_minutes` - Estimated preparation time
- `availability_schedule` - JSON schedule for when item is available
- `menu_types` - Available for dine-in, delivery, takeaway

### SEO & Display
- `visible` - Show/hide on menu
- `homepage_featured` - Feature on homepage
- `meta_title` - SEO meta title
- `meta_description` - SEO meta description
- `internal_notes` - Notes for staff/customers
- `tags` - Search tags and filters

## Temporary Workaround

I've also updated your code to handle missing columns more gracefully. If you try to add a menu item now:

1. **It will first try with all fields** (and fail if columns are missing)
2. **Then retry with only basic fields** that should exist
3. **Show you an error message** reminding you to run the SQL fix
4. **The menu item will still be created** with the basic information

So you can continue working, but you'll need to run the SQL script to use the advanced features.

## After Running the Fix

Once you've run the SQL script:
- All menu items will have the new fields with default values
- You'll be able to use all advanced menu management features
- No more schema cache errors!
- Your existing menu items will remain unchanged

## Need Help?

If you encounter any errors when running the SQL:
1. Copy the full error message
2. Check if you have the necessary permissions (you need to be the project owner or have database admin rights)
3. Make sure you're running the script in the correct project

## Verification Query

After running the fix, you can verify it worked by running:

```sql
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'menu_items'
  AND column_name IN (
    'availability_schedule', 
    'variants', 
    'inventory_linked',
    'visible',
    'homepage_featured',
    'promo_price',
    'promo_active'
  )
ORDER BY column_name;
```

You should see all 7 columns listed in the results.
