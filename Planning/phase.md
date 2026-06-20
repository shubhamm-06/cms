# CurateMyStay — Phase 2 Setup Reference

**Status:** Supabase and related project setup completed, except Vercel/hosting  
**Project:** CurateMyStay Property Management Website  
**Admin Email:** curatemystay@gmail.com  
**Purpose:** Future reference document for what has been set up and what remains pending.

---

## 1. Phase 2 Setup Summary

The main backend and authentication setup for the CurateMyStay project has been completed.

Completed areas:

- Supabase project setup
- Supabase Auth setup
- Email/password login setup
- Google login setup
- User profile structure
- Admin/owner role logic
- Database tables
- Row Level Security planning/setup
- Signup flow logic
- Protected admin account logic
- Landing page enquiry form email target decided
- Core project environment requirements identified

Pending area:

- Vercel/hosting setup
- Production domain setup
- Production redirect URL update after deployment

---

## 2. Platforms Used

The project uses the following platforms:

### Supabase

Used for:

- Authentication
- Database
- User roles
- Row Level Security
- App data storage
- Admin/owner access control

### Google Cloud Console

Used for:

- Google OAuth login
- Google Client ID
- Google Client Secret

### Email Service

Required for:

- Landing page enquiry form
- Sending form submissions to `curatemystay@gmail.com`

Recommended service:

- Resend

### Hosting

Pending.

Recommended:

- Vercel

---

## 3. Supabase Project Setup

A Supabase project has been created for CurateMyStay.

Important Supabase values required in the project:

- Supabase Project URL
- Supabase Anon Public Key
- Supabase Service Role Key

Important rule:

- The anon public key can be used in frontend code.
- The service role key must never be exposed in frontend code.
- The service role key should only be used in secure server-side routes when required.

---

## 4. Authentication Setup

Supabase Authentication has been planned/set up with:

- Email/password login
- Google login

Signup is open to anyone.

However, signup does not automatically give dashboard access.

New users should be created as:

- Role: owner
- Status: pending

Admin must later approve the user and assign the correct role/status/property.

---

## 5. Google Login Setup

Google login has been configured/planned through:

1. Google Cloud Console
2. Supabase Google Auth Provider

Google Cloud setup includes:

- OAuth consent screen
- Web application OAuth client
- Google Client ID
- Google Client Secret

Supabase setup includes:

- Google provider enabled
- Google Client ID added
- Google Client Secret added

Required callback URL format:

```txt
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

Local development URLs:

```txt
http://localhost:3000
http://localhost:3000/auth/callback
```

Production URLs will be added after hosting/domain setup.

---

## 6. Signup and Approval Logic

Signup should be open to anyone.

Recommended user flow:

1. User signs up using email/password or Google.
2. Supabase creates the auth user.
3. A matching profile is created in the `profiles` table.
4. New users are marked as pending owners by default.
5. Admin reviews the user.
6. Admin changes status to active.
7. If the user is an owner, admin assigns a property.
8. User can access the dashboard after approval.

Default user state:

```txt
role = owner
status = pending
```

Protected admin user:

```txt
email = curatemystay@gmail.com
role = admin
status = active
is_protected = true
```

---

## 7. Protected Main Admin Account

The main admin account is:

```txt
curatemystay@gmail.com
```

Important rules:

- This admin account cannot be deleted.
- The UI should hide the delete option for this account.
- The database should block deletion of protected profiles.
- This account should always remain active admin.

---

## 8. Database Tables

The Phase 2 database structure includes the following core tables:

1. `profiles`
2. `properties`
3. `bookings`
4. `expenses`
5. `owner_payouts`
6. `owner_queries`
7. `settings`
8. `contact_submissions`

Tables kept for later:

- calendar
- forma
- budgeting
- receipt uploads
- advanced audit/version history
- multi-owner property mapping

---

## 9. profiles Table

Purpose:

Stores app-specific user details connected to Supabase Auth users.

Main fields:

- id
- email
- name
- phone
- role
- status
- avatar_url
- is_protected
- created_at
- updated_at

Role values:

```txt
admin
owner
```

Status values:

```txt
pending
active
inactive
```

Important rules:

- Every Supabase Auth user should have a matching profile.
- New users default to owner + pending.
- `curatemystay@gmail.com` is admin + active + protected.

---

## 10. properties Table

Purpose:

Stores property information.

Main fields:

- id
- name
- city
- address
- bedrooms
- owner_id
- owner_share
- cms_share
- image_url
- status
- created_at
- updated_at

Important rules:

- One property can have only one owner.
- Owner is linked using `owner_id`.
- Owner share and CMS share should total 100.
- Owner can view their property but cannot edit it.
- Admin can add, edit, and delete properties.

---

## 11. bookings Table

Purpose:

Stores booking and income records.

Main fields:

- id
- property_id
- guest_name
- guest_phone
- source
- check_in
- check_out
- nights
- guests
- nightly_rate
- total_amount
- status
- cleaning_schedule
- concierge
- notes
- created_at
- updated_at

Booking status values:

```txt
upcoming
in_house
checked_out
cancelled
blocked
```

Important rules:

- Admin can add, edit, and delete bookings.
- Owner can view bookings for their own property.
- Owner can see guest names.
- Owner can see guest phone numbers.
- Owner cannot edit or delete bookings.

---

## 12. expenses Table

Purpose:

Stores both property expenses and CMS/company expenses in one table.

Main fields:

- id
- expense_for
- property_id
- date
- category
- amount
- vendor
- note
- created_at
- updated_at

Expense type values:

```txt
property
cms
```

Rules:

- If `expense_for = property`, then `property_id` is required.
- If `expense_for = cms`, then `property_id` should be empty.
- Admin can add, edit, and delete expenses.
- Owner can view only expenses related to their own property.
- Owner cannot view CMS expenses.
- Owner cannot edit or delete expenses.

No receipt/image upload is included in Phase 1.

---

## 13. owner_payouts Table

Purpose:

Stores owner monthly payout data and approval placeholder.

Main fields:

- id
- property_id
- owner_id
- month
- revenue_total
- expense_total
- net_profit
- owner_share_amount
- cms_share_amount
- tds_amount
- final_payout_amount
- status
- admin_note
- owner_note
- approved_at
- paid_at
- created_at
- updated_at

Possible payout statuses:

```txt
draft
ready_for_review
approved
query_raised
resolved
paid
```

Important rules:

- Owner payout approval is part of Phase 1.
- Final approval flow is not confirmed yet.
- Keep this feature as a placeholder until final flow is approved.
- TDS should be entered manually by admin.
- Do not assume TDS is always 10%.

---

## 14. owner_queries Table

Purpose:

Basic placeholder for owner query/dispute feature.

Main fields:

- id
- owner_id
- property_id
- payout_id
- message
- status
- resolved
- resolved_at
- created_at
- updated_at

Status values:

```txt
open
resolved
```

Phase 1 query behavior:

- Owner query/dispute flow is not finalized.
- Keep this module empty or very basic.
- Admin can read queries.
- Admin can mark a query as resolved using a check mark.
- No conversation thread is required.
- No advanced dispute workflow is required.

---

## 15. settings Table

Purpose:

Stores editable dropdowns and configurable lists.

Main fields:

- id
- key
- value
- created_at
- updated_at

Examples of settings:

- booking_sources
- expense_categories
- concierge_options
- cleaning_options

This allows admin to update common dropdowns without editing code.

---

## 16. contact_submissions Table

Purpose:

Stores landing page form submissions.

Main fields:

- id
- name
- email
- phone
- message
- source_page
- created_at

Landing page form behavior:

1. Visitor submits enquiry form.
2. Submission is stored in Supabase.
3. Email is sent to `curatemystay@gmail.com`.
4. Visitor sees a success message.

Recommended email service:

- Resend

---

## 17. Row Level Security

Row Level Security should be enabled on all public tables.

Tables requiring RLS:

- profiles
- properties
- bookings
- expenses
- owner_payouts
- owner_queries
- settings
- contact_submissions

Main RLS rules:

### Admin

Admin can:

- View everything
- Add, edit, and delete users
- Add, edit, and delete properties
- Add, edit, and delete bookings
- Add, edit, and delete expenses
- View all P&L/payout data
- View and resolve queries
- Manage settings

Admin cannot:

- Delete protected admin account `curatemystay@gmail.com`

### Owner

Owner can:

- View own profile
- Edit own profile
- View own property
- View own property bookings
- View own property guest names and phone numbers
- View own property expenses
- View own payout data
- Create/view own query if enabled

Owner cannot:

- View other owners
- View other properties
- View CMS expenses
- Edit bookings
- Edit expenses
- Edit property details
- Add users
- Add admins
- Delete anything
- Access settings

---

## 18. Environment Variables Required

Local development should use `.env.local`.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=
ADMIN_CONTACT_EMAIL=curatemystay@gmail.com
```

Important rules:

- `NEXT_PUBLIC_SUPABASE_URL` can be used in frontend.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be used in frontend.
- `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only.
- `RESEND_API_KEY` must remain server-side only.

---

## 19. Landing Page Form Email Setup

The landing page enquiry form should send details to:

```txt
curatemystay@gmail.com
```

Recommended flow:

1. User fills form.
2. Next.js API route receives form data.
3. API route validates form data.
4. API route stores submission in `contact_submissions`.
5. API route sends email using Resend.
6. UI shows success message.

Email should include:

- Name
- Email
- Phone
- Message
- Source page
- Submission date/time

---

## 20. Storage

Storage is not mandatory in Phase 1.

Not required for now:

- Receipt upload
- Image receipt upload
- Document upload

Optional later:

- Property images
- Profile avatars
- Receipt uploads
- Owner documents
- Statement PDFs

Recommended:

Keep storage out of the first build unless images are truly needed.

---

## 21. Hosting / Vercel Status

Hosting is not completed yet.

Pending tasks:

1. Push project code to GitHub.
2. Import project into Vercel.
3. Add environment variables in Vercel.
4. Set production domain.
5. Update Supabase Site URL.
6. Update Supabase Redirect URLs.
7. Update Google OAuth authorized origins.
8. Test Google login in production.
9. Test enquiry form in production.
10. Confirm owner/admin dashboard redirects in production.

Recommended hosting platform:

```txt
Vercel
```

Reason:

- Easier Next.js deployment.
- Better compatibility with App Router.
- Simpler environment variable setup.
- Easier for Codex-based development.

---

## 22. Future Hosting Environment Variables

When hosting is set up, add these in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-final-domain.com
RESEND_API_KEY=
ADMIN_CONTACT_EMAIL=curatemystay@gmail.com
```

After production deployment, update Supabase Auth:

```txt
Site URL = https://your-final-domain.com
```

Redirect URLs:

```txt
http://localhost:3000/auth/callback
https://your-final-domain.com/auth/callback
https://your-vercel-preview-url.vercel.app/auth/callback
```

Update Google OAuth:

Authorized JavaScript origins:

```txt
http://localhost:3000
https://your-final-domain.com
```

Authorized redirect URI:

```txt
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

---

## 23. Test Data Recommended

For testing, create:

### Admin

```txt
curatemystay@gmail.com
```

Expected profile:

```txt
role = admin
status = active
is_protected = true
```

### Test Owner

```txt
owner@example.com
```

Expected profile:

```txt
role = owner
status = active
```

### Test Property

```txt
Demo Villa
```

Assigned to:

```txt
owner@example.com
```

### Test Bookings

Create at least:

- One upcoming booking
- One checked-out booking

### Test Expenses

Create at least:

- One property expense
- One CMS expense

Testing goal:

- Admin can see all data.
- Owner can see only their property data.
- Owner can see guest names and phone numbers.
- Owner can see property expenses.
- Owner cannot see CMS expenses.
- Owner cannot edit bookings.
- Owner cannot edit expenses.
- Owner can edit own profile.
- Protected admin cannot be deleted.

---

## 24. Items Kept for Later

The following are not part of the current setup/MVP:

- Hosting/Vercel setup, still pending
- Booking Calendar
- Forma Sheet
- Budgeting
- Airbnb sync
- Booking.com sync
- Razorpay/payment integration
- WhatsApp automation
- Receipt/image upload
- Advanced query/dispute system
- Advanced housekeeping automation
- Staff assignment
- Mobile app
- Advanced analytics
- GST automation
- Advanced PDF generation
- Multi-owner property split
- Separate company expense module
- Advanced notification system
- Advanced audit/version history
- Automatic owner statement PDF
- Automated TDS calculation
- Automated payout processing
- Owner email notifications
- Admin email notification for every signup
- Guest communication tools
- Direct booking engine

---

## 25. Important Warnings

Do not:

- Expose the Supabase service role key in frontend.
- Expose the Resend API key in frontend.
- Allow public signup to create admins.
- Allow owners to edit bookings.
- Allow owners to edit expenses.
- Allow owners to view CMS expenses.
- Delete `curatemystay@gmail.com`.
- Build complex query/dispute flow yet.
- Build calendar now.
- Build Forma Sheet now.
- Build budgeting now.
- Add receipt upload now.
- Overbuild payout approval until final flow is confirmed.

---

## 26. Final Reference Summary

Phase 2 backend and authentication setup is considered mostly complete, except hosting.

Completed:

- Supabase project
- Supabase Auth
- Email/password login
- Google login setup
- Database structure
- Profiles and roles
- Admin/owner access logic
- Protected main admin logic
- RLS approach
- Landing page form email target
- Required environment variables

Pending:

- Vercel/hosting setup
- Production domain
- Production Supabase redirect URLs
- Production Google OAuth URLs
- Production environment variables
- Final payout approval flow
- Final query/dispute flow
