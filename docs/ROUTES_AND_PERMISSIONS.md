# Routes and Permissions

Route layouts and server actions enforce application roles. Supabase RLS must independently enforce the same data boundaries. See [Supabase Schema](./SUPABASE_SCHEMA.md) and [API Contracts](./API_CONTRACTS.md).

## Public and Auth Routes

| Route | Purpose | Access | Security or behavior note |
| --- | --- | --- | --- |
| `/` | Reference-style homepage and owner forecast funnel | Public | Skips proxy session refresh; forecast calculations still run server-side through APIs |
| `/login` | Email/password and Google login | Public | Redirects by profile status and role after authentication |
| `/signup` | Public account registration | Public | Always creates a pending owner profile; never creates an admin |
| `/auth/callback` | Supabase auth code exchange | Public callback | Creates a safe pending-owner fallback profile when required, then redirects by role/status |
| `/pending-approval` | Pending-account notice | Public/pending | Pending users cannot enter dashboards |
| `/account-disabled` | Inactive-account notice | Public/inactive | Inactive users cannot enter dashboards |

## Public APIs

| Route | Method | Purpose | Access | Security or behavior note |
| --- | --- | --- | --- | --- |
| `/api/contact` | POST | Store a general enquiry and optionally notify admin | Public | Zod validation; server-side Supabase/Resend usage |
| `/api/owner-forecast` | POST | Validate, calculate, and store an owner forecast lead | Public | Returns the forecast without waiting for PDF generation; calculator is server-authoritative |
| `/api/owner-forecast/proposal` | POST | Recalculate forecast and generate the pitch deck | Public | Calls Apps Script separately; credentials remain server-only; returns safe PDF URLs |

The proposal endpoint sends the admin email after the generation attempt. It sends the owner a link-only email only after successful generation with a download URL.

## Admin Routes

All `/dashboard/*` routes require an authenticated profile with `role = admin` and `status = active`.

| Route | Purpose | Key behavior |
| --- | --- | --- |
| `/dashboard` | Operational overview | KPIs, property performance, occupancy, and upcoming check-ins |
| `/dashboard/users` | User management | Activate/deactivate users and change roles; protected admin cannot be demoted, disabled, or deleted |
| `/dashboard/properties` | Property management | Create/edit/delete properties, assign one owner, and maintain owner/CMS shares totaling 100 |
| `/dashboard/bookings` | Booking management | Create/edit/delete; date status is server-calculated; property dropdown filtering |
| `/dashboard/expenses` | Expense management | Create/edit/delete property and CMS expenses; CMS is default and has no property |
| `/dashboard/pnl` | P&L reporting | Operational revenue, expenses, profit, and share view |
| `/dashboard/payouts` | Owner payout operations | Ensures previous-month records on page load; displays combined rows and property breakups; permits mark-paid only from approved/resolved |
| `/dashboard/queries` | Owner query inbox | Resolve or delete queries with linked-payout restoration rules |
| `/dashboard/settings` | Dropdown settings | Manages booking sources, expense categories, and concierge options as JSON arrays |
| `/dashboard/profile` | Admin profile | Admin edits own name, phone, and avatar URL |

Admin mutation actions call `requireRole("admin")`. UI visibility is not the security boundary.

## Owner Routes

All `/owner/*` routes require an authenticated profile with `role = owner` and `status = active`. `getOwnerData()` scopes records to the authenticated owner's property IDs and owner ID; RLS must also enforce this scope.

| Route | Purpose | Key behavior |
| --- | --- | --- |
| `/owner` | Owner overview | Current-month live performance plus owner-scoped operational summaries |
| `/owner/property` | Property details | Read-only assigned property information |
| `/owner/bookings` | Booking list | Read-only assigned-property bookings, including guest names and phone numbers; owner-property filter only |
| `/owner/expenses` | Expense list | Read-only property expenses; CMS expenses excluded |
| `/owner/payout` | Live performance and payout history | Top panel is informational current-month calculation; table contains all monthly payout records latest first, including previous-month payable statements |
| `/owner/queries` | Owner queries | Create and view own simple queries |
| `/owner/profile` | Owner profile | Edit own name, phone, and avatar URL only |

### Owner Payout Actions

- Previous-calendar-month payable records are ensured when `/owner/payout` loads.
- The current-month live panel does not create a payout row and has no review actions.
- From the 1st through 5th, the owner may approve or query only an owned `ready_for_review` row.
- Server actions re-check role, ownership, status, and review window.
- After the 5th, untouched previous-month `draft` or `ready_for_review` records are auto-approved during page-load processing.
- Owners cannot edit payout amounts or TDS, mark payouts paid, see admin notes, or see another owner's records.

## Role Summary

| Capability | Public | Active owner | Active admin |
| --- | ---: | ---: | ---: |
| Submit forecast/contact request | Yes | Yes | Yes |
| Read operational data | No | Own assigned data | All operational data subject to RLS |
| Manage users/properties/bookings/expenses/settings | No | No | Yes |
| Read CMS expenses | No | No | Yes |
| Approve/query eligible owner payout | No | Own only | No |
| Resolve query / mark payout paid | No | No | Yes |
