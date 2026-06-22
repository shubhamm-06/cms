# Admin Operations Guide

This guide describes the current admin workflows. Access details are in [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md); payout formulas are in [Payout Logic](./PAYOUT_LOGIC.md).

## Users

- Public signups arrive as pending owners.
- Activate an owner by changing status to active after verification.
- Admin can change role, status, name, and phone.
- The protected admin is identified by the protected flag or configured protected address. The application prevents deletion and forces role/status to admin/active on updates.
- Supabase Auth user deletion is not implemented by the profile delete action.

## Properties

- Create or edit from `/dashboard/properties`; pencil actions load the existing row through `?edit=<id>`.
- Assign at most one owner and set active/inactive status.
- Owner share plus CMS share must equal 100.
- The Image URL control was removed. Editing a property does not submit `image_url`, so an existing stored value is preserved.
- The schema declares cascade deletion for related bookings, property expenses, and payouts. Review linked query references before deleting a property because query foreign keys do not declare cascade behavior.

## Bookings

- Create or edit from `/dashboard/bookings`; table pencil actions load the existing booking.
- Property, guest, dates, guests, rates, source, concierge, and notes are maintained in one form.
- Nights auto-fill from dates; total and nightly rate update from the last relevant edit. These remain editable conveniences.
- Check-out before check-in is rejected.
- Booking status is not selected manually. The server stores upcoming before check-in, in-house from check-in through the day before check-out, and checked-out on/after check-out.
- The current form does not expose cancelled/blocked overrides, although those statuses remain in schema/calculation handling.
- Source and concierge options come from settings. Existing legacy values remain available while editing.
- Cleaning is not used in the application UI; the database column remains.

## Expenses

- CMS is the default expense type.
- CMS selection clears and disables property; the server always stores null property ID.
- Property expense requires an existing property and is server-checked.
- Category options come from settings; legacy edit values are preserved.
- Owners see only their assigned property expenses, never CMS expenses.

## Queries

- Admin can resolve owner queries. Resolving a payout-linked query changes the payout from `query_raised` to `resolved`.
- Admin can delete queries with confirmation and status feedback.
- Deleting a linked query restores a queried payout to `ready_for_review` during days 1-5, or `approved` after day 5.
- If query deletion fails after restoration, the action attempts to return the payout to `query_raised`.

## Payouts

- Opening `/dashboard/payouts` ensures previous-month payout rows for active owners.
- The table shows combined owner-month rows; detail cards show live property-wise breakups.
- There is no manual send-for-approval step and no editable TDS field.
- TDS is fixed at 10% of positive owner share.
- Resolve linked queries before payment when required.
- Mark paid is available only for approved or resolved payouts; it sets status and `paid_at`.
- Current processing depends on payout page loads, not a scheduled job.

## Settings

`/dashboard/settings` stores one option per line as JSON arrays for:

- `booking_sources`
- `expense_categories`
- `concierge_options`

Changes feed the booking and expense forms. Avoid removing an option still used by historical records unless the retained edit-value behavior is understood.
