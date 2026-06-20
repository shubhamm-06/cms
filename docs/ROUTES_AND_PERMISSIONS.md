# Routes And Permissions

## Public

- `/`: landing page
- `/login`
- `/signup`
- `/auth/callback`
- `/pending-approval`
- `/account-disabled`
- `/api/contact`

## Admin

- `/dashboard`
- `/dashboard/users`
- `/dashboard/properties`
- `/dashboard/bookings`
- `/dashboard/expenses`
- `/dashboard/pnl`
- `/dashboard/payouts`
- `/dashboard/queries`
- `/dashboard/settings`
- `/dashboard/profile`

Admin users must be active. Admin can manage all Phase 1 data except deleting the protected admin account. Admin data tables use TanStack Table for sorting/search/pagination, but mutations still post to existing admin-only server actions.

Admin payout permissions:

- `/dashboard/payouts` ensures previous-month payouts on page load.
- Admin can review combined owner-month payouts and property-wise breakup.
- Admin can resolve linked payout queries from `/dashboard/queries`.
- Admin can mark approved or resolved payouts as paid.
- Admin cannot manually edit TDS; TDS is fixed at 10% when owner profit is positive.

## Owner

- `/owner`
- `/owner/property`
- `/owner/bookings`
- `/owner/expenses`
- `/owner/payout`
- `/owner/queries`
- `/owner/profile`

Owner users must be active. Owners can only see their own assigned property data and cannot edit operational records. Owner bookings, expenses, payouts, and query history use TanStack tables.

Owner payout permissions:

- `/owner/payout` ensures the owner's previous-month payout on page load.
- From the 1st through 5th, a `ready_for_review` payout can be approved or queried by the owner.
- After the 5th, untouched ready payouts are auto-approved by page-load processing.
- Raising a payout query creates an owner query linked to the payout and moves the payout to `query_raised`.
- Owners cannot mark payouts paid, edit payout amounts, edit TDS, or see other owners' payouts.
