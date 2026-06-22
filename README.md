# CurateMyStay

CurateMyStay is a Next.js and Supabase application for short-term rental operations in Goa. It combines a public owner-acquisition forecast funnel with role-protected admin and property-owner dashboards.

## Core Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- Tailwind CSS v4
- Supabase Auth and Postgres through `@supabase/ssr`
- Zod validation and TanStack Table
- Resend email and Google Apps Script pitch-deck generation

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- Optional for the complete public funnel: Resend and a deployed Apps Script proposal service

## Local Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Apply `supabase/schema.sql` and configure database policies before testing authenticated data. See [Setup](docs/SETUP.md) for local details and the [Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md) for production setup.

## Environment Overview

`.env.example` lists every active variable. Browser-safe variables begin with `NEXT_PUBLIC_`; Supabase service credentials, Apps Script credentials, and Resend credentials are server-only. Never commit real values.

## Verification

```bash
npm run lint
npm run build
```

## Main Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/login`, `/signup`, `/pending-approval`, `/account-disabled` |
| Public APIs | `/api/contact`, `/api/owner-forecast`, `/api/owner-forecast/proposal` |
| Admin | `/dashboard` and `/dashboard/*` |
| Owner | `/owner` and `/owner/*` |

The complete route and access matrix is in [Routes and Permissions](docs/ROUTES_AND_PERMISSIONS.md).

## Documentation

Start with the [Documentation Index](docs/INDEX.md). It provides the recommended reading order and directs maintainers to the source of truth for calculator, payout, API, schema, operations, and deployment work.

Recommended sequence: README -> Documentation Index -> AI Project Context -> Project Overview -> Routes and Permissions -> Supabase Schema -> task-specific guide. Read the changelog last and only for history.

## Deployment

Deploy to a Next.js-compatible host after configuring production environment variables, Supabase Auth redirects and RLS policies, a verified Resend sender, and the Apps Script dependency. Run the deployment smoke tests before enabling real users.
