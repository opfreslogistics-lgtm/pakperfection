# Pak Perfection - Restaurant Website

A powerful, fully customizable Next.js + Supabase restaurant website with complete admin control, order management, and payment processing.

## Features

- ✅ **Full Admin Control** - First user becomes admin automatically
- ✅ **Light/Dark Mode** - Toggle between themes
- ✅ **Multi-color Themes** - Customizable colors (white, green, red, yellow, black)
- ✅ **Payment Methods** - Zelle, CashApp, and Cash payments
- ✅ **Order Management** - Complete order tracking and status management
- ✅ **Payment Proof Upload** - Users can upload payment screenshots
- ✅ **Menu Management** - Full CRUD for menu items and categories
- ✅ **Media Library** - Upload and manage images
- ✅ **Responsive Design** - Works on all devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Database, Authentication, and Storage
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pak-perfection
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Create a storage bucket named `media` with public access
4. Get your Supabase URL and anon key from Settings > API

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First User Setup

1. Navigate to `/register`
2. Create your account - **The first user automatically becomes admin**
3. Log in and access the admin dashboard at `/admin`

## Admin Features

### Global Settings
- Upload branding (logo, favicon, etc.)
- Customize theme colors and fonts
- Configure navigation and footer
- Manage pop-ups and notifications
- SEO settings for all pages

### Content Management
- Menu items and categories
- Blog posts
- Gallery images
- Team members
- Events
- FAQ items

### Order Management
- View all orders
- Update order status
- Approve/reject payment proofs
- Track delivery addresses

### Payment Settings
- Configure Zelle, CashApp, and Cash payment methods
- Upload payment logos and QR codes
- Set payment instructions

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── home/              # Home page
│   ├── menu/              # Menu page
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout page
│   └── ...
├── components/            # React components
│   ├── admin/             # Admin components
│   ├── home/              # Home page components
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase client setup
│   └── ...
├── supabase/              # Database migrations
└── ...
```

## Database Schema

The database includes tables for:
- `profiles` - User profiles with roles
- `orders` - Order management
- `payment_settings` - Payment method configurations
- `payment_proofs` - Uploaded payment proofs
- `menu_items` - Menu items
- `menu_categories` - Menu categories
- `pages` - Custom pages
- `media` - Media library
- And more...

## Security

- Row-Level Security (RLS) policies enforce admin-only access
- First user automatically becomes admin via database trigger
- All admin operations are secured at the database level
- Payment proofs are stored securely in Supabase Storage

## Deployment

### 🚀 Vercel Deployment (Recommended)

**Quick Steps:**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/opfreslogistics-lgtm/pakperfection.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "Add New Project" → Import `opfreslogistics-lgtm/pakperfection`
   - Add environment variables (see below)
   - Click "Deploy"

3. **Required Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
   ```

4. **Optional (Email):**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_FROM_NAME=Pak Perfection
   ```

**📖 See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.**

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS Amplify

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License



