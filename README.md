# 🗺️ GlobeTrotter - Travel Planning Platform

A production-ready Next.js travel planning application with custom UI, database modeling, and end-to-end functionality.

## Features

✅ **Authentication System**
- Email/password login and signup
- Protected routes with NextAuth.js
- Session management

✅ **Trip Management**
- Create and manage trips
- Add destinations (cities) to trips
- Track activities per destination
- Budget and expense tracking
- Trip status (upcoming, ongoing, past)

✅ **Cities Explorer**
- Browse 8+ seeded cities
- Search and filter by region
- Cost index and popularity ratings

✅ **Custom UI Components**
- Button, Input, Modal, Card
- DatePicker, Dropdown, Tooltip
- Toast notifications
- Skeleton loaders
- All built from scratch (no UI libraries)

✅ **Modern Tech Stack**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with custom design system
- Framer Motion for animations
- Prisma ORM with PostgreSQL
- Supabase for database hosting

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Validation:** Zod
- **Password Hashing:** bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd c:\Users\wwwst\OneDrive\Desktop\GlobeTrotter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   
   The `.env` and `.env.local` files are already configured with Supabase credentials. For production, update `NEXTAUTH_SECRET`:
   
   ```bash
   NEXTAUTH_SECRET=your-secure-random-string-here
   ```

4. **Database is already set up!**
   
   ✅ Migrations have been run
   ✅ Database is seeded with demo data

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Demo Credentials

```
Email: demo@globetrotter.com
Password: demo123
```

## Project Structure

```
GlobeTrotter/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Home dashboard
│   │   ├── trips/            # Trip management
│   │   ├── cities/           # City explorer
│   │   └── profile/          # User profile
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth endpoints
│   │   ├── trips/            # Trip CRUD
│   │   └── cities/           # City data
│   └── layout.tsx            # Root layout
├── components/
│   └── ui/                   # Custom UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── DatePicker.tsx
│       ├── Dropdown.tsx
│       ├── Toast.tsx
│       ├── Tooltip.tsx
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       └── Skeleton.tsx
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client
│   ├── utils.ts              # Utility functions
│   └── validators.ts         # Zod schemas
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data script
└── package.json
```

## Database Schema

The application uses 8 main models:

- **User** - User accounts
- **UserPreferences** - User settings
- **Trip** - Travel trips
- **TripStop** - Cities in trips
- **Activity** - Activities per stop
- **City** - Global city master data
- **Expense** - Trip expenses
- **SharedTrip** - Public trip sharing

## Available Scripts

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio to view data
npx prisma generate  # Regenerate Prisma Client
npx tsx prisma/seed.ts  # Re-seed the database

# Quality
npm run lint         # Run ESLint
```

## Features Implemented

### ✅ Completed (Core Features)

1. **Authentication** - Login, Signup, Protected Routes
2. **Dashboard** - Welcome page with trip overview and stats
3. **My Trips** - List view with upcoming/ongoing/past categorization
4. **Create Trip** - Form with validation and date pickers
5. **Trip Detail** - Full itinerary view with activities
6. **Cities Explorer** - Search and filter cities
7. **Profile** - View user information
8. **Custom UI Library** - 10+ components built from scratch

### 🚧 Planned for Future Enhancement

1. Itinerary Builder (drag & drop stops)
2. Budget Management Page (charts and breakdowns)
3. Activity Search and Management
4. Calendar/Timeline View
5. Public Trip Sharing
6. Forgot Password Flow
7. Admin Dashboard
8. Advanced Charts (SVG-based)
9. Image Upload for Trips
10. Export/Print Itineraries

## Design System

### Colors

- **Primary:** Deep Blue (#0F4C81) / Teal (#0D9488)
- **Secondary:** Coral (#FF6B6B) / Warm Orange (#F59E0B)
- **Neutrals:** Slate 50-900

### Typography

- **Font:** Inter
- **Headings:** Bold, 4xl → xl
- **Body:** Base (16px)

### Components

- **Rounded:** 2xl (16px) for cards
- **Shadows:** Soft, Card, Elevated
- **Animations:** Fade-in, Slide-up, Scale-in (200-300ms)

## Seeded Data

The database includes:

- **1 Demo User** (demo@globetrotter.com)
- **8 Cities** (Paris, Tokyo, New York, Barcelona, Bali, Dubai, London, Rome)
- **1 Sample Trip** (European Adventure 2026 with 3 stops and 6 activities)

## Notes

- All UI components are custom-built (no shadcn, MUI, etc.)
- Animations powered by Framer Motion
- Form validation using Zod
- Type-safe API routes with TypeScript
- Responsive design (mobile-first approach)

## Production Deployment

For deployment to Vercel:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Environment variables needed:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## License

Private project - All rights reserved

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
