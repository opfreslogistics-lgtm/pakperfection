# Hero Slider Owner Image - Customization Guide

## ✅ What Was Updated

Your homepage hero slider now has:

1. **Left-Aligned Text** - All slider text (title, subtitle, CTA) is now aligned to the left
2. **Fixed Owner Image** - A transparent image of you at the bottom right that:
   - Stays in place while slides transition
   - Has beautiful animations:
     - **Float animation** - Gentle up/down movement (6 seconds)
     - **Fade in from right** - Slides in on page load
     - **Glow effect** - Pulsing glow behind the image
     - **Decorative orbs** - Floating yellow and red orbs
3. **Better Contrast** - Darker gradient overlay on the left for better text readability
4. **Fully Responsive** - Image scales appropriately on mobile, tablet, and desktop

## 🖼️ How to Replace with Your Image

### Step 1: Prepare Your Image

1. **Use a transparent PNG** - Remove the background from your photo
2. **Recommended size**: 500px wide x 600px tall (portrait orientation)
3. **File format**: PNG with transparency
4. **Optimize**: Keep file size under 200KB for fast loading

### Step 2: Upload to Supabase Storage

1. Go to **Supabase Dashboard** → **Storage**
2. Select the `media` bucket (or create it if it doesn't exist)
3. Upload your transparent PNG
4. Click on the uploaded file and copy the **public URL**

### Step 3: Update the Code

Open `components/home/hero-slider.tsx` and find line **187**:

```typescript
// Replace this URL with your image
<Image
  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=600&fit=crop&crop=faces"
  alt="Chef Owner"
  width={500}
  height={600}
```

Replace the `src` URL with your Supabase image URL:

```typescript
<Image
  src="https://your-project.supabase.co/storage/v1/object/public/media/your-image.png"
  alt="Restaurant Owner"
  width={500}
  height={600}
```

### Step 4: Commit and Push

```bash
git add components/home/hero-slider.tsx
git commit -m "Update: Add owner photo to hero slider"
git push origin cursor/deploy-and-verify-project-on-vercel-claude-4.5-sonnet-thinking-f80e
```

Vercel will automatically redeploy!

## 🎨 Customization Options

### Change Image Size

In `components/home/hero-slider.tsx` line 180, modify the width classes:

```typescript
// Current (small on mobile, large on desktop)
<div className="absolute bottom-0 right-0 w-64 md:w-96 lg:w-[500px] h-auto">

// Make it bigger
<div className="absolute bottom-0 right-0 w-80 md:w-[450px] lg:w-[600px] h-auto">

// Make it smaller
<div className="absolute bottom-0 right-0 w-48 md:w-80 lg:w-[400px] h-auto">
```

### Change Image Position

```typescript
// Bottom right (current)
<div className="absolute bottom-0 right-0">

// Bottom left
<div className="absolute bottom-0 left-0">

// Center bottom
<div className="absolute bottom-0 left-1/2 -translate-x-1/2">
```

### Disable Animations

Remove animation classes from line 181 and 191:

```typescript
// With animations (current)
<div className="relative w-full h-full animate-float">
  <Image className="...animate-fadeInRight" />

// Without animations
<div className="relative w-full h-full">
  <Image className="..." />
```

### Change Animation Speed

In `app/globals.css`, modify the animation durations:

```css
/* Float animation - change 6s to your preferred duration */
.animate-float {
  animation: float 4s ease-in-out infinite; /* Faster */
}

/* Bounce animation */
.animate-bounce-slow {
  animation: bounce-slow 6s ease-in-out infinite; /* Slower */
}
```

## 📱 Mobile Optimization

The image automatically:
- Scales down on mobile (w-64 = 256px)
- Medium size on tablets (w-96 = 384px)
- Full size on desktop (w-[500px] = 500px)

To hide on mobile completely:

```typescript
<div className="hidden md:block absolute bottom-0 right-0...">
```

## 🎭 Available Animations

Currently applied:
- ✅ **animate-float** - Gentle floating motion
- ✅ **animate-fadeInRight** - Slide in from right
- ✅ **animate-pulse-slow** - Glow effect pulsing
- ✅ **animate-bounce-slow** - Decorative orbs

All animations are defined in `app/globals.css`.

## 🚀 Deployment Status

✅ **Changes pushed to GitHub**
✅ **Vercel will auto-deploy** (check your Vercel dashboard)

The branch `cursor/deploy-and-verify-project-on-vercel-claude-4.5-sonnet-thinking-f80e` has been updated.

## 🔍 Preview Your Changes

After Vercel deploys:
1. Visit your homepage
2. The slider text should be left-aligned
3. Your owner image should appear at bottom right with smooth animations
4. Image should float gently and have a glowing effect

---

**Files Modified:**
- `components/home/hero-slider.tsx` - Added owner image and left-aligned text
- `app/globals.css` - Added custom animations

**To customize**: Replace the image URL on line 187 of `hero-slider.tsx` with your transparent photo!
