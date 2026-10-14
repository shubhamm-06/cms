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
- Admin -> Properties manages public catalogue fields in a separate Website listing section. `show_on_website` controls catalogue visibility independently of operational `status`; disabling it preserves existing catalogue details. Public identity, location, copy, capacity, lists, price display, stay/enquiry settings, catalogue controls, and SEO remain property-specific and editable here. The optional Airbnb listing URL (same section, saved with the listing fields when Show on website is on) must be an HTTPS Airbnb listing link such as `https://www.airbnb.co.in/rooms/12345678`; when set, the public page links to it as social proof.
- Save a new property before managing its gallery. In edit mode, active admins can upload JPEG, PNG, or WebP images up to 10 MB directly to the `property-images` bucket. Browser-native processing resizes only images whose longest side exceeds 2400px and uses WebP at approximately 0.85 quality only when the result is smaller; otherwise the valid original is uploaded. The database stores generated Storage paths only; admins can set the cover, save alt text, move images up/down, and delete images with confirmation. The first uploaded image becomes the cover. The single property save button appears after image management. Legacy `image_url` is not modified. Alt text is also the public photo caption. To group photos in the public photo tour, start the alt text with a room name and a pipe, for example `Bedroom 2 | Bed with ceiling fan`: the room name becomes the section title and the text after the pipe the caption. Each photo card shows its detected room and a hint when none is found, has a room picker that writes the prefix into the alt text field (save it with Save alt), and has a Select box so several photos can be given a room at once. Without a prefix the room is guessed from keywords in the alt text. When several rooms match, the guess follows a fixed priority (WC, Bathroom, Kitchen, Pool, Dining area, Work area, Balcony, Bedroom, Living room, Exterior, Common area), so `Bedroom with balcony` is guessed as Balcony; use the prefix to override a guess. Photos with no detected room appear last under Additional photos. Rooms follow the order of each room's earliest photo in the up/down order, so order the photos to order the rooms; the cover is not moved first in the tour, only in the page's top grid. A read-only `Tour order:` line above the photo list shows the resulting section order and updates live as you reorder photos or edit a room prefix. A gallery with fewer than two detected rooms shows a plain 2-column grid.
- Admins can import properties from CSV in `/dashboard/properties`.
  The seven operational headers are `property_name`, `owner_email`, `address`, `city`, `bedrooms`, `owner_share_percentage`, and `status`. All seven columns must be present. A CSV with only these headers behaves as it always has and imports every property hidden (`show_on_website = false`).
  The importer accepts `.csv` files up to 5 MB and 1,000 non-empty rows, previews every row before writing, and re-validates server-side before insert.
  Required values are property name, owner email, owner share percentage, and status. Address, city, and bedrooms are optional supported property fields; bedrooms must be a nonnegative whole number when provided.
  Owner email must resolve to an existing active owner profile. `owner_share_percentage` is converted into complementary owner/CMS shares and must satisfy the existing property validator. Status must be `active` or `inactive`, stays operational, and is independent of `show_on_website`.
  Existing property names and repeated property names inside the CSV are skipped as duplicates using trimmed, lowercase, collapsed-space name matching. Invalid rows and duplicates are never inserted, and imports never overwrite existing properties.
  **Optional website listing headers** (all non-image catalogue fields, each named after its `properties` column):
  - Publishing: `show_on_website`, `accept_booking_requests`
  - Identity: `slug`, `public_name`, `public_property_type`, `promotional_badge`, `display_order`, `is_featured`, `show_in_similar_properties`
  - Location: `region`, `area`, `short_location_line`, `public_location_text`, `google_maps_url`, `distance_from_beach`
  - Copy: `tagline`, `short_description`, `full_description`
  - Capacity: `beds`, `bathrooms`, `max_guests`, `pool_type`
  - Lists: `property_highlights`, `amenities`, `house_rules`
  - Price display: `show_price`, `starting_price`, `price_note`
  - Stay and enquiry: `minimum_nights`, `check_in_time`, `check_out_time`, `booking_enquiry_note`
  - SEO: `seo_title`, `seo_description`

  Listing value rules:
  - A blank cell, or an omitted column, uses the same default as the admin form (from `propertySchema`): `accept_booking_requests` true, `show_price` true, `show_in_similar_properties` true, `is_featured` false, `display_order` 0, `show_on_website` false.
  - Booleans accept `true`/`false`, `yes`/`no`, or `1`/`0`, case-insensitive. Anything else makes the row invalid.
  - List fields (`property_highlights`, `amenities`, `house_rules`) put all items in one cell separated by the pipe character, for example `Private pool|Wi-Fi|Parking`. Items are trimmed, empty items are dropped, and items are de-duplicated case-insensitively (first spelling kept). Newlines inside cells are not used as separators.
  - `check_in_time` and `check_out_time` use 24-hour `HH:MM` (for example `14:00`) and are stored the way the admin form stores them.
  - Numbers follow the database constraints: `beds` and `bathrooms` at least 0, `bathrooms` with at most one decimal place, `max_guests` and `minimum_nights` at least 1, `starting_price` at least 0 with at most two decimal places, `display_order` at least 0. `beds`, `max_guests`, `minimum_nights`, and `display_order` must be whole numbers.
  - Slug: must be lowercase letters, numbers, and single hyphens (no uppercase or spaces; it is not silently corrected). When `show_on_website` is true and `slug` is blank, the slug is generated from `public_name` with the same helper the admin form uses. A slug that already exists in the database (case-insensitive), or that repeats inside the CSV (including a generated one), makes the row invalid. This differs from property names, where duplicates are skipped. A hidden row with a blank slug gets no slug.
  - Publishing: when `show_on_website` is true the row runs the full admin publish-readiness validation, so the required public fields (public name, slug, property type, region, area, short location line, short and full description, bedrooms, bathrooms, and maximum guests) must be present. The preview lists every missing field. When `show_on_website` is false, only the format of provided values is checked, so partial listing data is saved as a hidden draft. This differs from the admin form, which discards listing data when a new property is saved hidden.
  - Images cannot come from CSV and `image_url` is never written. Published rows show a non-blocking "Published without images. Add a gallery after import." warning; add the gallery from the property's edit form afterwards.
  - If the insert hits a unique slug violation (for example a concurrent save took the slug after preview), nothing is created and the dialog shows a row-level slug message rather than a generic failure.

  The preview shows Row, Property, Owner email, Status, Website (`Published`, `Hidden`, or `Hidden with draft data`), Slug, Result, and Reason, with the validation message for each invalid row. Address, city, bedrooms, owner share, and every provided listing value are in a per-row Details toggle.
  Download Demo CSV produces a UTF-8 BOM file with all headers and three fictional Goa rows: an operational-only row, a fully populated published row, and a hidden row with partial listing data.
  Extra unknown headers are ignored, but malformed data rows with more columns than the header row are rejected with guidance to quote comma-containing values.
  Any file-level validation error or invalid preview row blocks the entire confirmation action. The dialog highlights invalid rows, reports the invalid-row count, and requires a corrected CSV upload before import; duplicate rows remain non-blocking because they are explicitly skipped.
  The import dialog resets selected files, preview rows, validation errors, result messages, and summary counts whenever it closes.
- The schema declares cascade deletion for related bookings, property expenses, payout statements, owner queries linked directly to the property, and owner queries linked to payout statements that are deleted with the property.
- Before property deletion, the action reads image paths from that property's own `property_images` rows. After the database deletion is verified, it removes only trusted paths below that property ID from the `property-images` bucket. Missing objects do not block deletion; a Storage-policy/provider failure leaves the property deleted and shows a cleanup warning.

## Public Catalogue and Booking Enquiries

The planned catalogue/enquiry work is documented in [Public Property Catalogue and Booking Enquiries](./PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md).

- The live Supabase project already has manual catalogue fields, `property_images`, the `property-images` bucket, and active-admin policies. Checked-in schema/types now represent the property fields and image table; Storage bucket configuration and policies remain documented only.
- Public booking enquiries must remain separate from confirmed operational bookings.
- A public enquiry must not create a booking, block availability, affect revenue, occupancy, expenses, P&L, payouts, or owner booking views.
- The future admin conversion flow should review the enquiry, prefill the existing booking form, let the admin verify availability/pricing/details, submit the normal booking workflow, and mark the enquiry converted only after successful booking creation.

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
- Production requires one unique owner/month payout row. Run the duplicate-detection query and then manually apply the unique index in [Payout Logic](./PAYOUT_LOGIC.md); the application safely reloads a row that wins a concurrent insert.
- Owner approve/query and admin resolve/mark-paid writes use status-qualified updates. Query/payout multi-step failures attempt compensation and show failure feedback rather than false success.

## Settings

`/dashboard/settings` stores one option per line as JSON arrays for:

- `booking_sources`
- `expense_categories`
- `concierge_options`

Changes feed the booking and expense forms. Avoid removing an option still used by historical records unless the retained edit-value behavior is understood.
