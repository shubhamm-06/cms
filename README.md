# CurateMyStay

CurateMyStay is a small Next.js + Supabase property management dashboard for short-term rental operations.

## Tech Stack

- Next.js App Router 16
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and RLS
- `@supabase/ssr`
- Zod
- React Hook Form ready validators
- Lucide React
- Resend for enquiry emails

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
ADMIN_CONTACT_EMAIL=curatemystay@gmail.com
```

## Main Routes

- `/` public landing page and enquiry form
- `/login`, `/signup`, `/auth/callback`
- `/pending-approval`, `/account-disabled`
- `/dashboard` admin dashboard
- `/owner` owner dashboard
- `/api/contact` landing enquiry endpoint

## Deployment

Deploy to a Next.js host such as Vercel after configuring Supabase Auth redirect URLs, RLS policies, and Resend environment variables.
