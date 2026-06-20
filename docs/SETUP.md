# Setup

## Supabase

1. Create the tables from `supabase/schema.sql`.
2. Enable RLS on all tables.
3. Add policies that match `docs/SUPABASE_SCHEMA.md` and `docs/ROUTES_AND_PERMISSIONS.md`.
4. Ensure `curatemystay@gmail.com` has an active protected admin profile.

## Auth

Enable email/password auth in Supabase. For Google login, configure the Google provider in Supabase and add:

- `http://localhost:3000/auth/callback`
- Your production `/auth/callback` URL

## Email

Set `RESEND_API_KEY` and `ADMIN_CONTACT_EMAIL`. The contact route saves the submission and sends an email when Resend is configured.

## Local Env

Copy `.env.example` to `.env.local` and fill in Supabase/Resend values. Never put service role or Resend keys in frontend code.
