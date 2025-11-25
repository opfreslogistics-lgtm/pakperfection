# Advanced Menu System - Setup Guide

## 🚀 New Features Added

Your menu management system has been upgraded to a **MEGA ADVANCED** system with 4 comprehensive sections:

### Section 1: Basic Details ✅
- **Title** - Menu item name
- **Short Description** - Subtitle shown on menu cards  
- **Full Description** - Detailed description shown in cart modal
- **Category** - Menu category
- **Price** - Regular price
- **Promo Price** - Sale/promotional price
- **Image Upload** - Item image

### Section 2: Variants & Ingredients 🆕
- **Variants** - Size options, color options, etc. (Small/Medium/Large)
- **Add-ons** - Optional extras (already exists as Upsells)
- **Ingredients** - List of ingredients for transparency
- **Allergen Flags** - Warning tags (Dairy, Nuts, Gluten, Soy, Eggs, Shellfish)

### Section 3: Logistics & Operations 🆕
- **Inventory Tracking** - Enable/disable stock management
- **Current Stock** - Available quantity
- **Low Stock Threshold** - Alert when stock is low
- **Prep Time** - Estimated preparation time in minutes
- **Availability Schedule** - Days/hours item is available
- **Menu Types** - Available for Dine-in, Delivery, and/or Takeaway

### Section 4: SEO & Display 🆕
- **Show/Hide** - Control visibility on menu
- **Homepage Feature** - Feature on homepage hero/featured section
- **Meta Title** - SEO title for search engines
- **Meta Description** - SEO description
- **Internal Notes** - **Shows in cart popup** for customers
- **Tags** - Search and filter tags

## 📋 Database Migration Required

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Add all advanced menu fields
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS promo_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS promo_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ingredients TEXT[],
ADD COLUMN IF NOT EXISTS allergen_flags TEXT[],
ADD COLUMN IF NOT EXISTS inventory_linked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_stock INTEGER,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS menu_types TEXT[] DEFAULT ARRAY['dine-in', 'delivery', 'takeaway'],
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS homepage_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_visible ON menu_items(visible);
CREATE INDEX IF NOT EXISTS idx_menu_items_homepage_featured ON menu_items(homepage_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_promo_active ON menu_items(promo_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_inventory_linked ON menu_items(inventory_linked);
```

## 🎨 New Features in Cart Modal

When customers click on a menu item, they'll now see:

1. **Internal Notes Section** - Your notes displayed prominently
2. **Allergen Warnings** - Clear allergy information
3. **Ingredients List** - Full transparency
4. **Prep Time** - Estimated wait time
5. **Promotional Pricing** - Sale price with original price struck through

## 📱 Admin Panel Updates

The admin menu management page now has:

### Tabbed Interface
- 4 tabs for organized data entry
- Collapsible sections for better UX
- Visual indicators for required fields
- Real-time validation

### Smart Features
- **Inventory Alerts** - Get notified when stock is low
- **Schedule Editor** - Set availability by day/time
- **SEO Preview** - See how it looks in search results
- **Multi-select** - Tags, allergens, menu types with chips

### Bulk Operations
- Bulk edit multiple items
- Quick enable/disable
- Mass update categories

## 🔥 Use Cases

### Restaurant with Variants
```
Item: "Chicken Wings"
Variants:
- 6 pieces (+$0)
- 12 pieces (+$5)  
- 24 pieces (+$10)
```

### Allergen Warnings
```
Item: "Pad Thai"
Allergen Flags: [Shellfish, Peanuts, Soy]
```

### Limited Availability
```
Item: "Breakfast Burrito"
Availability: Monday-Friday, 7:00 AM - 11:00 AM
```

### Promotional Pricing
```
Item: "Lunch Special"
Regular Price: $15.99
Promo Price: $12.99 (Active)
Shows: ~~$15.99~~ $12.99
```

## 🚀 Next Steps

1. **Run the SQL migration** in Supabase
2. **Refresh your admin panel** 
3. **Edit a menu item** to see the new form
4. **Add variants, ingredients, and notes**
5. **Test the cart modal** on the customer-facing menu

## 💡 Pro Tips

1. **Use Internal Notes for**:
   - Cooking instructions customers should know
   - Customization limitations
   - Special serving suggestions

2. **Set Prep Time for**:
   - Managing customer expectations
   - Kitchen workflow optimization
   - Delivery time calculations

3. **Use Variants for**:
   - Size options (S/M/L)
   - Protein choices (Chicken/Beef/Tofu)
   - Spice levels (Mild/Medium/Hot)

4. **Enable Inventory for**:
   - Limited quantity items
   - Daily specials
   - Seasonal offerings

Your menu system is now enterprise-grade! 🎉
