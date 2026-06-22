# Project Overview

CurateMyStay helps a property-management team operate short-term rentals while giving property owners a clear, restricted view of their own property performance.

## Primary Users

- **Prospective property owner:** uses the public website and revenue forecast funnel.
- **Company admin:** manages users, properties, bookings, expenses, payouts, queries, settings, and operational reporting.
- **Property owner:** views only assigned properties, bookings, property expenses, live performance, payout statements, queries, and profile details.

## Public Owner-Acquisition Funnel

The reference-style homepage explains the service and includes a three-step property forecast form. The server estimates annual revenue, a fixed 15% operating cost, and net profit, then the browser requests a custom pitch deck separately. Commercial terms are discussed after property review.

The public funnel does **not** display owner share, CMS share, TDS, payout amounts, or a fixed commercial split. Exact rules are in [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md).

## Admin Dashboard

Admins approve accounts and manage the Phase 1 operating records. The dashboard covers properties, bookings, property and CMS expenses, P&L, monthly owner payouts, owner queries, configurable dropdown options, and the admin profile.

## Owner Dashboard

Owners receive a transparency-focused, read-only operational view scoped to assigned properties. They can see booking guest details, property expenses, live current-month performance, and monthly payout statements. Their limited writes are profile updates, simple queries, and permitted payout approve/query actions during the review window.

## Phase 1 Scope

- Public acquisition homepage and owner forecast funnel
- Email/password and Google authentication through Supabase
- Pending, active, and inactive account states
- Admin operations dashboard
- Owner transparency dashboard
- Previous-month payout generation and review workflow
- Simple owner queries and settings-backed dropdowns

## Intentionally Deferred

Calendar views, Forma Sheet, budgeting, channel synchronization, receipt uploads, payment integration, WhatsApp automation, advanced disputes, scheduled payout jobs, and owner statement PDFs are not implemented.

See [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md) for access boundaries.
