# CurateMyStay Website — Phase 1 Product Blueprint

**Version:** Phase 1 Review Draft  
**Prepared for:** CurateMyStay Property Management Website  
**Primary focus:** Dashboard product logic, user roles, workflows, and MVP scope  
**Admin contact email:** curatemystay@gmail.com

---

## 1. Project Overview

CurateMyStay will be a property management website with two main parts:

1. **Public landing page**
2. **Private dashboard**

The landing page is already designed. No major design or content changes are required in Phase 1. The work needed on the landing page is limited to:

- Convert the existing landing page into a Next.js page.
- Keep the existing look and feel.
- Add relevant login/signup/dashboard options in the navbar.
- Make the enquiry/contact form functional.
- Send form submissions directly to `curatemystay@gmail.com`.
- Show a clear success message after form submission.

The dashboard is the main product.

The dashboard will be used by two types of logged-in users:

1. **Company Admin**
2. **Property Owner**

The main goal is to build a clean, simple, and easy-to-maintain dashboard that works for the current scale of approximately 6 users and 8 properties, while still being able to support around 60 users and 80 properties later.

The system should avoid unnecessary complexity. It should be easy for a human developer and Codex to understand, edit, and maintain.

---

## 2. Main Purpose of the Website

The website should help CurateMyStay do three things:

1. Present the company professionally to property owners.
2. Manage property operations internally.
3. Give owners transparent access to their property data.

The core value of the dashboard is **transparency**.

Owners should be able to log in and clearly see:

- Their property details
- Their bookings
- Guest names and phone numbers
- Income related to their property
- Expenses related to their property
- Monthly payout details
- Payout approval status, once the approval flow is finalized
- Their own profile details

Admins should be able to manage all operational and financial data from one place.

---

## 3. User Types

There are three user types in the website flow:

1. Visitor
2. Company Admin
3. Property Owner

---

## 4. Visitor

A visitor is someone who has not logged in.

### Visitor can:

- View the landing page
- Read about CurateMyStay
- Submit the contact/enquiry form
- Go to login/signup

### Visitor cannot:

- Access the dashboard
- View property data
- View owner reports
- View admin data

---

## 5. Company Admin

Company Admin is the internal CurateMyStay team.

### Company Admin can:

- View the full dashboard
- View, add, edit, and delete users
- Add property owners
- Add company admins
- Add, edit, and delete properties
- Add, edit, and delete bookings
- Add, edit, and delete expenses
- Add expenses for a specific property
- Add CMS/company expenses from the same expense module
- View P&L
- View owner dashboard/owner portal data
- View owner queries, if the query feature is added
- Mark owner queries as resolved using a simple check mark
- Manage settings and configurable lists
- Edit their own profile

### Important admin rules:

- Admins can only be added by another admin.
- Public signup should not directly create an admin account.
- The main admin account `curatemystay@gmail.com` must be protected and cannot be deleted.
- Admin should have the option to edit and delete existing records, except protected records such as the main admin account.

---

## 6. Property Owner

Property Owner is the external owner/client.

### Owner can:

- Log in to their dashboard
- View their own property
- View bookings for their property
- View guest names and guest phone numbers
- View income for their property
- View expenses for their property
- View all data related to their property
- View monthly payout details
- Approve monthly payout once the approval flow is finalized
- Raise a query once the query feature is finalized
- View query status once the query feature is finalized
- View and edit their own profile

### Owner cannot:

- View other owners
- View other properties
- Edit property details
- Edit bookings
- Edit expenses
- Add users
- Add admins
- View admin-only settings
- View CMS/company expenses that are not related to their property
- Delete anything from the dashboard

---

## 7. Signup and Login Flow

Signup should be open to anyone.

However, dashboard access should still be controlled.

### Recommended signup flow:

1. A user signs up from the login/signup page.
2. The user account is created in a pending state.
3. Admin reviews the user.
4. Admin assigns the correct role.
5. If the user is an owner, admin assigns a property to the user.
6. User gets dashboard access after admin approval.

### Important rules:

- Signup is open to anyone.
- New signup users should not automatically get admin access.
- Admin role can only be assigned by an existing admin.
- The main admin account `curatemystay@gmail.com` cannot be deleted.

---

## 8. Landing Page

The landing page is already made.

No major changes are required to the landing page design or content.

### Required work:

- Convert the existing landing page HTML/design to Next.js.
- Keep the existing design and content as close as possible.
- Add login/signup/dashboard button in the navbar.
- Make the enquiry/contact form functional.
- Send form submissions to `curatemystay@gmail.com`.
- Show a success message after submission.
- Handle failed form submission gracefully.

### Recommended navbar behavior:

For logged-out users:

- Home
- Existing landing page sections
- Contact / Enquire
- Login / Signup

For logged-in users:

- Home
- Existing landing page sections
- Dashboard

The landing page is not the priority for dashboard logic. It mainly acts as a marketing and enquiry page.

---

## 9. Dashboard Concept

The dashboard is the most important part of the project.

It should work like an operations console for CurateMyStay.

The dashboard should help admins answer:

- How many bookings do we have?
- Which properties are active?
- How much revenue came in?
- What expenses were added?
- What is the owner payout?
- What is the company/CMS share?
- Which owner needs to approve payout?
- Are there any owner queries?
- What housekeeping or laundry work exists, if enabled later?

The dashboard should be clean, simple, and easy to edit.

The file structure and code structure should remain simple because the project will mostly be built and maintained with Codex.

---

## 10. Admin Dashboard Pages

### 10.1 Overview

Purpose: give the company a quick summary of operations.

Admin should see:

- Total revenue
- Total expenses
- Net profit
- Number of properties
- Number of bookings
- Upcoming check-ins
- Recent bookings
- Recent expenses
- Pending owner approvals, once approval flow is finalized
- Open owner queries, once query feature is finalized

This page should mostly be read-only.

Editing should happen inside specific modules like Users, Properties, Bookings, and Expenses.

---

### 10.2 Users

Purpose: manage people who can access the dashboard.

Admin should be able to:

- View all users
- Add new owner
- Add new admin
- Edit user details
- Delete user
- Change user role
- Activate/deactivate user
- Assign owner to property
- View user email, phone, name, role, and status

Owner should not access the Users page.

Important rules:

- Admin can view and edit users.
- Admin can delete users.
- Admin can add other admins.
- Admin can add property owners.
- Public signup should not directly create admins.
- The main admin account `curatemystay@gmail.com` cannot be deleted.

---

### 10.3 Properties

Purpose: manage all properties.

Admin should be able to add, edit, and delete properties.

Property data should include:

- Property name
- City
- Address
- Bedrooms
- Owner
- Owner share percentage
- CMS/company share percentage
- Property image or image key, if needed
- Active/inactive status

Important rule:

- One property can have only one owner.

Owner access:

- Owner can view their own property details.
- Owner cannot edit property details.

---

### 10.4 Bookings & Income

Purpose: track bookings and revenue.

Admin should be able to add, edit, and delete bookings.

Booking data should include:

- Property
- Guest name
- Guest phone number
- Booking source
- Check-in date
- Check-out date
- Number of nights
- Number of guests
- Nightly rate
- Total amount
- Booking status
- Cleaning schedule, if needed
- Concierge options, if needed
- Notes, if needed

Booking statuses can include:

- Upcoming
- In-house
- Checked-out
- Cancelled
- Blocked

Owner access:

- Owners can view all booking data related to their own property.
- Owners can see guest names.
- Owners can see guest phone numbers.
- Owners cannot add, edit, or delete bookings.

---

### 10.5 Expenses

Purpose: track both property expenses and CMS/company expenses in one place.

There should not be a separate Company Expenses module in the final Phase 1 structure.

Instead, the Expenses module should have a **Property/CMS field**.

In this field, admin can select:

1. A specific property
2. CMS

If a specific property is selected, it becomes a property expense.

If CMS is selected, it becomes a company/CMS expense.

Admin should be able to add, edit, and delete expenses.

Expense data should include:

- Date
- Property or CMS
- Category
- Amount
- Vendor
- Note

No receipt/image upload is required in Phase 1.

Owner access:

- Owners can view all expenses related to their property.
- Owners can view all data regarding their property.
- Owners cannot see CMS/company expenses.
- Owners cannot add, edit, or delete expenses.

---

### 10.6 P&L

Purpose: show profit and loss.

Admin should see:

- Revenue
- Property expenses
- CMS/company expenses
- Net profit
- Owner share
- CMS/company share
- TDS, if applicable
- Final payout

Owner should see:

- Revenue from their property
- Expenses from their property
- Net property profit
- Owner share
- TDS, if applicable
- Final payout

Important rules:

- Owner should only see P&L data related to their own property.
- TDS should be entered manually by admin.
- TDS should not be assumed to always be 10%.

---

### 10.7 Owner Portal / Owner Statement Area

Purpose: allow admins to review owner-facing data and owners to view their property performance.

Owner should see:

- Their property
- Monthly revenue
- Monthly expenses
- Net profit
- Owner share
- CMS/company share, if shown
- TDS, if applicable
- Final payout
- Approval status, once enabled

Owner can:

- View data
- Approve payout once the approval flow is finalized
- Raise a query once the query feature is finalized

Owner cannot:

- Edit statement values
- Edit bookings
- Edit expenses
- Delete anything

Important note:

Owner payout approval should be included in Phase 1, but the exact approval flow is not finalized yet. For now, keep the approval flow section blank or as a simple placeholder until the final flow is confirmed.

---

### 10.8 Owner Query / Dispute

Current status:

Keep this empty or very simple for now.

The full query/dispute flow will be confirmed later.

For Phase 1, if this module is included, it should be very basic.

Admin should be able to:

- View owner query
- Read query details
- Mark query as resolved using a check mark

No complex conversation system is required in Phase 1.

No advanced dispute workflow is required in Phase 1.

No notifications are required in Phase 1.

---

### 10.9 Booking Calendar

Current status:

Not necessary for Phase 1.

Calendar can be kept for later.

If added later, it can show:

- All properties
- Booking blocks by date
- Booking status
- Booking source
- Basic booking details on click

For now, calendar should not delay MVP work.

---

### 10.10 Housekeeping & Laundry

Current status:

Not a priority, but good to have.

For Phase 1, this can be a simple placeholder or basic module.

Admin may eventually see:

- Checkout cleaning
- Mid-stay cleaning
- Laundry count
- Pending/done status
- Notes

Owner does not need housekeeping/laundry access unless specifically required later.

Recommendation:

Keep housekeeping/laundry as a basic placeholder or simple module only if easy. Do not spend too much time on advanced scheduling.

---

### 10.11 Forma Sheet

Current status:

Keep for later.

Purpose, when added later:

Admin-only reporting sheet for guest/statistical information.

It may eventually track:

- Booking
- Guest origin
- Guest count
- Male/female count
- Age group count
- Purpose of visit
- Remarks

Owner should not access Forma Sheet.

---

### 10.12 Budgeting

Current status:

Keep for later.

Purpose, when added later:

Internal planning for CurateMyStay.

It may eventually include:

- Monthly budget
- Operational cost planning
- Technology/tool cost planning
- Travel cost planning
- Legal/compliance planning
- Contingency planning

Owner should not access budgeting.

---

### 10.13 Settings

Purpose: allow admin to edit common dropdowns and rules without changing code.

Admin should be able to manage:

- Booking sources
- Expense categories
- Concierge options
- Cleaning options
- Laundry rules, if used
- Other configurable lists

This is important because the project should be easy to manage later without editing code for every small change.

Owner should not access settings.

---

## 11. Owner Dashboard Pages

Owner dashboard should be much simpler than admin dashboard.

Recommended owner pages:

1. My Property
2. Bookings
3. Expenses
4. P&L / Monthly Statement
5. Profile
6. Queries, later if required

Owner dashboard homepage should show:

- Property name
- Current month revenue
- Current month expenses
- Estimated payout
- Recent bookings
- Recent expenses
- Approval status, once approval flow is active

Owner should be able to edit only their own profile.

Owner profile fields can include:

- Name
- Phone number
- Email, read-only or editable depending on auth rules
- Profile image, optional
- Basic account details

---

## 12. Monthly Payout Flow

Purpose: calculate and show how much needs to be paid to the owner.

Owner payout approval should be included in Phase 1, but the final approval flow will be confirmed later.

For now, keep this area as a placeholder.

Basic planned flow:

1. Admin adds bookings.
2. Admin adds expenses.
3. System calculates revenue and expenses.
4. System calculates owner share and CMS/company share.
5. Admin manually enters TDS, if applicable.
6. Owner views monthly payout.
7. Owner approves payout once final flow is confirmed.
8. Admin marks payout as paid, if payment tracking is added.

Possible payout statuses:

- Draft
- Ready for Review
- Approved
- Query Raised
- Resolved
- Paid

Important:

The final approval/query process is not confirmed yet. Codex should not overbuild this section until the exact flow is approved.

---

## 13. Permissions Summary

### Admin permissions

Admin can:

- View everything
- Add, edit, and delete users
- Add, edit, and delete properties
- Add, edit, and delete bookings
- Add, edit, and delete expenses
- Add CMS expenses from the same Expenses module
- View all P&L data
- View all owner data
- View queries
- Mark queries as resolved
- Manage settings
- Edit own profile

Admin cannot:

- Delete the protected main admin account `curatemystay@gmail.com`

---

### Owner permissions

Owner can:

- View own property
- View own bookings
- View guest names and phone numbers for own property bookings
- View own property expenses
- View own property P&L
- View payout details
- Approve payout once enabled
- Raise query once enabled
- Edit own profile

Owner cannot:

- View other properties
- View other owners
- View CMS expenses
- Edit bookings
- Edit expenses
- Edit property details
- Add users
- Add admins
- Delete anything
- Access admin settings

---

## 14. Phase 1 MVP Scope

The first working version should include:

1. Existing landing page converted to Next.js
2. Login/signup
3. Open signup with admin approval/control
4. Functional landing page enquiry form
5. Enquiry form email sent to `curatemystay@gmail.com`
6. Admin dashboard shell
7. Owner dashboard shell
8. Users management
9. Protected main admin account `curatemystay@gmail.com`
10. Properties management
11. One owner per property
12. Bookings management
13. Guest names and phone numbers visible to property owner
14. Expenses management with Property/CMS option
15. No receipt/image upload in Phase 1
16. P&L summary
17. Manual TDS entry by admin
18. Owner property view
19. Owner booking view
20. Owner expense view
21. Owner profile edit
22. Basic owner payout view
23. Payout approval placeholder, pending final flow
24. Basic query placeholder, pending final flow
25. Settings
26. Housekeeping/laundry placeholder or simple module, only if easy

---

## 15. Later / Not in Phase 1

These items should be clearly kept for later and should not delay the MVP.

### Later features

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

## 16. Important Product Rules

1. Admin has full control over dashboard data.
2. Owner has read-only access to property data.
3. Owner can edit only their own profile.
4. One property can have only one owner.
5. Owners can see guest names and guest phone numbers for their own property.
6. Owners can see all bookings and expenses related to their property.
7. Owners cannot see CMS/company expenses.
8. No receipt upload is required in Phase 1.
9. CMS/company expense should be added from the Expenses module by selecting CMS instead of a property.
10. Admin can edit and delete existing records.
11. The main admin account `curatemystay@gmail.com` cannot be deleted.
12. Query/dispute module should remain empty or very basic until confirmed.
13. If query is included, admin only needs read option and resolved check mark.
14. Housekeeping/laundry is not priority, but good to have.
15. Calendar is not necessary for Phase 1.
16. Forma Sheet is for later.
17. Budgeting is for later.
18. Landing page is already made and should only be converted to Next.js.
19. Landing page form should send details to `curatemystay@gmail.com`.
20. Dashboard should remain simple and easy to edit.
21. Code structure should be simple enough for human editing and Codex maintenance.
22. TDS should be entered manually by admin.
23. Signup is open to anyone, but access and role should be controlled by admin.

---

## 17. Final Phase 1 Summary

CurateMyStay website will have a public landing page and a private dashboard.

The landing page is already designed. It only needs to be converted to Next.js, connected to a working enquiry form, and updated with login/signup/dashboard access in the navbar.

The dashboard is the main product.

Company Admins will manage users, properties, bookings, expenses, P&L, settings, and owner-related data. Admins can add, edit, and delete existing records, but the protected main admin account `curatemystay@gmail.com` cannot be deleted.

Property Owners will have a restricted dashboard where they can view all information related to their own property, including bookings, guest names, guest phone numbers, expenses, payout details, and their profile. Owners can edit only their own profile.

Expenses will be managed from one module. Admin can either select a property or select CMS. If a property is selected, it is a property expense. If CMS is selected, it is a company/CMS expense.

Owner payout approval is part of Phase 1, but the final approval flow is not confirmed yet, so it should remain a placeholder for now.

Query/dispute flow is not finalized yet. For now, it should remain empty or very basic, with only read and mark-as-resolved functionality.

Housekeeping and laundry are not priority, but can be kept as a simple placeholder or basic module if easy.

Calendar, Forma Sheet, and Budgeting are not part of Phase 1 and should be kept for later.

The main goal is to create a clean, transparent, simple property management dashboard that is easy to maintain and easy to expand later.

---

## 18. Ready for Phase 2

Once this Phase 1 blueprint is approved, Phase 2 will define exactly what needs to be done in:

- Supabase
- Authentication
- Database tables
- User roles
- Permissions
- Storage, if needed later
- Environment variables
- Hosting platform
- Email service for enquiry form
- Initial admin setup
- Initial data setup

Phase 2 should not start until the above product logic is approved.
