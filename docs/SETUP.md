# Local Setup

## 1. Install

```bash
npm install
copy .env.example .env.local
```

Fill `.env.local` with development values. Never commit it.

## 2. Configure Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Add and verify RLS policies for the access model in [Supabase Schema](./SUPABASE_SCHEMA.md). The repository SQL enables RLS but does not define policies.
4. Enable email/password authentication.
5. For Google login, enable the provider and configure the local app callback as `http://localhost:3000/auth/callback`.
6. Create or verify the protected active admin profile described in the deployment runbook.

## 3. Optional Funnel Services

- Configure Resend to send forecast and contact emails.
- Configure the Apps Script webhook and shared secret to generate pitch-deck PDFs.
- Configure the public WhatsApp number for follow-up links.

The forecast result works independently from proposal generation, but the downloadable deck requires Apps Script.

## 4. Run

```bash
npm run dev
```

If port 3000 is already occupied, stop the stale dev process or use the alternate URL printed by Next.js. Do not run two Next dev servers for the same checkout.

## 5. Verify

```bash
npm run lint
npm run build
```

For production configuration and smoke tests, use the [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md).
