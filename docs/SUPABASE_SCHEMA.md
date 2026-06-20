# Supabase Schema

The SQL reference lives at `supabase/schema.sql`.

## Tables

- `profiles`: app profile linked to `auth.users`; role is `admin` or `owner`; status is `pending`, `active`, or `inactive`.
- `properties`: property details with one `owner_id`.
- `bookings`: booking and income records linked to a property.
- `expenses`: both property and CMS expenses; CMS expenses have no `property_id`.
- `owner_payouts`: monthly owner payout records generated from bookings, property expenses, carry-forward loss, and fixed 10% TDS when owner profit is positive.
- `owner_queries`: simple owner query records that admin can mark resolved.
- `settings`: JSON arrays for common dropdowns.
- `contact_submissions`: public enquiry form submissions.

## Important Rules

- Public signup creates pending owner profiles only.
- `curatemystay@gmail.com` must remain active, admin, and protected.
- Owners can update only their profile fields: name, phone, avatar URL.
- Owners can read their own property, bookings, property expenses, payouts, and queries.
- Owners can approve their own ready-for-review payout or raise a linked payout query during the review window.
- Owners cannot read CMS expenses.
- Admin can manage operational records, except deleting the protected admin.
- Admin can resolve payout queries and mark approved/resolved payouts as paid; TDS is not manually edited in the UI.

## Payout Notes

- The database schema remains unchanged for the payout flow.
- Previous-month payouts are ensured when admin or owner payout pages load.
- One owner-month row is stored in `owner_payouts`; when an owner has multiple active properties, the property-wise breakup is calculated live from bookings and expenses.
- `property_id` remains populated for schema compatibility.
- `net_profit` stores the adjusted net profit after previous negative carry-forward is applied.
- `tds_amount` is fixed at 10% of positive owner share and zero when there is no positive owner payout.

## RLS Summary

RLS is the primary security boundary. The UI hides actions for clarity, but policies must enforce owner scoping and admin-only writes in the database.
