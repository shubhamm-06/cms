# Admin Operations Guide

This guide describes the current admin workflows. Access details are in [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md); payout formulas are in [Payout Logic](./PAYOUT_LOGIC.md).

## Users

- Public signups arrive as pending owners.
- Activate an owner by changing status to active after verification.
- Admin can change role, status, name, and phone.
- The protected admin is identified by the protected flag or configured protected address. The application prevents deletion and forces role/status to admin/active on updates.
- Deleting an eligible user requires a configured server-only `SUPABASE_SERVICE_ROLE_KEY`. The action verifies the target Auth user first, removes the application profile row that blocks the checked-in foreign key, deletes the linked Supabase Auth account through the Auth admin API, then verifies both records are gone before showing success.
- If Supabase Auth admin configuration is missing, invalid, or not allowed to delete users, the action shows a failure notice and does not report success.
- User deletion is blocked when the user owns linked operational records such as assigned properties, payout statements, or owner queries. Reassign operational records first or mark the account inactive instead.

## CSV Import Safeguards

- Properties, bookings, and expenses provide CSV demo downloads, parse UTF-8 BOM and quoted comma-containing values, and show a row-level preview before writing.
- Any blocking file-level error or row classified as invalid keeps `Confirm Import` natively disabled with visibly inactive styling. Invalid rows and their validation messages remain visible.
- The client submit handler and server action both reject imports containing validation errors, so ready rows are not partially inserted alongside invalid rows. Pending state disables confirmation and prevents duplicate submission.
- Selecting a replacement CSV clears the visible preview/result feedback from the previous file before calculating the new state. Existing/repeated duplicate rows remain non-blocking because each importer intentionally classifies and skips them.

## Properties

- Create or edit from `/dashboard/properties`; pencil actions load the existing row through `?edit=<id>`.
- Assign at most one owner and set active/inactive status.
- Owner share plus CMS share must equal 100.
- The Image URL control was removed. Editing a property does not submit `image_url`, so an existing stored value is preserved.
- Admins can import properties from CSV in `/dashboard/properties`.
  Supported headers are `property_name`, `owner_email`, `address`, `city`, `bedrooms`, `owner_share_percentage`, and `status`.
  The importer accepts `.csv` files up to 5 MB and 1,000 non-empty rows, previews every row before writing, and re-validates server-side before insert.
  Required values are property name, owner email, owner share percentage, and status. Address, city, and bedrooms are optional supported property fields; bedrooms must be a nonnegative whole number when provided.
  Owner email must resolve to an existing active owner profile. `owner_share_percentage` is converted into complementary owner/CMS shares and must satisfy the existing property validator. Status must be `active` or `inactive`.
  Existing property names and repeated property names inside the CSV are skipped as duplicates using trimmed, lowercase, collapsed-space name matching. Invalid rows and duplicates are never inserted, and imports never overwrite existing properties.
  Extra unknown headers are ignored, but malformed data rows with more columns than the header row are rejected with guidance to quote comma-containing values.
  Any file-level validation error or invalid preview row blocks the entire confirmation action. The dialog highlights invalid rows, reports the invalid-row count, and requires a corrected CSV upload before import; duplicate rows remain non-blocking because they are explicitly skipped.
  The import dialog resets selected files, preview rows, validation errors, result messages, and summary counts whenever it closes.
- The schema declares cascade deletion for related bookings, property expenses, payout statements, owner queries linked directly to the property, and owner queries linked to payout statements that are deleted with the property.

## Bookings

- Create or edit from `/dashboard/bookings`; table pencil actions load the existing booking.
- Property, guest, dates, guests, rates, source, concierge, and notes are maintained in one form.
- Admins can import bookings from CSV in `/dashboard/bookings`.
  Supported headers are `property_name`, `guest_name`, `guest_phone`, `check_in`, `check_out`, `guests`, `nightly_rate`, `total_amount`, `booking_source`, `concierge`, and `notes`.
  The importer accepts `.csv` files up to 5 MB and 1,000 non-empty rows, previews every row before writing, and re-validates server-side before insert.
  Required values are property name, guest name, check-in, check-out, and at least one of nightly rate or total amount. Guest phone, guest count, booking source, concierge, and notes are optional; blank guest count defaults to 1.
  Dates must use `YYYY-MM-DD`; check-in is inclusive, check-out is exclusive, and imported nights are always recalculated from the dates.
  If only nightly rate is supplied, total amount is calculated from nights. If only total amount is supplied, nightly rate is calculated from nights. If both are supplied, they must agree with the calculated nights.
  Booking source and concierge values must match the configured settings when provided.
  Duplicate matching uses property, normalized guest name, normalized guest phone, check-in, and check-out. Existing matches and repeated matches inside the CSV are skipped; imports never update existing bookings.
  Extra unknown headers are ignored, but malformed data rows with more columns than the header row are rejected with guidance to quote comma-containing values.
  Any file-level validation error or invalid preview row blocks the entire confirmation action. The dialog highlights invalid rows, reports the invalid-row count, and requires a corrected CSV upload before import; duplicate rows remain non-blocking because they are explicitly skipped.
  The import dialog resets selected file, preview rows, validation errors, result messages, and summary counts whenever it closes.
  Booking CSV import creates booking rows only. It does not create, recalculate, approve, or alter payout records.
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
- Admins can import expenses from CSV in `/dashboard/expenses`.
  Supported headers are `expense_date`, `expense_for`, `property_name`, `category`, `amount`, `vendor`, and `note`.
  The importer accepts `.csv` files up to 5 MB and 1,000 non-empty rows, previews every row before writing, and re-validates server-side before insert.
  Required values are expense date, expense type, category, and amount. `property_name` is required only for property expenses and must stay blank for CMS expenses; vendor and note are optional.
  Dates must use `YYYY-MM-DD`, `expense_for` must be `cms` or `property`, categories must match configured expense categories, and amounts must be positive numbers.
  Duplicate matching uses expense date, expense type, resolved property or CMS context, normalized category, amount, and normalized note. Existing matches and repeated matches inside the CSV are skipped; imports never update existing expenses.
  Extra unknown headers are ignored, but malformed data rows with more columns than the header row are rejected with guidance to quote comma-containing values.
  Any file-level validation error or invalid preview row blocks the entire confirmation action. The dialog highlights invalid rows, reports the invalid-row count, and requires a corrected CSV upload before import; duplicate rows remain non-blocking because they are explicitly skipped.
  The import dialog resets selected file, preview rows, validation errors, result messages, and summary counts whenever it closes.
  Expense CSV import creates expense rows only. It does not create or alter payout records.
- Owners see only their assigned property expenses, never CMS expenses.

## Queries

- New owner queries send an internal admin email to `ADMIN_CONTACT_EMAIL` after the owner query row is successfully created. Production should set this recipient to `curatemystay@gmail.com`.
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
