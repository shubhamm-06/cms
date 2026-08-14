# Deployment Runbook

Use this with [Local Setup](./SETUP.md) and [API Contracts](./API_CONTRACTS.md). Never place real credentials in repository files or deployment logs.

## Environment Checklist

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | Supabase anonymous/publishable key; constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret | Public lead insert path when RLS blocks anonymous insert |
| `APPS_SCRIPT_WEBHOOK_URL` | Server-only | Deployed proposal-generation endpoint |
| `APPS_SCRIPT_SECRET` | Server-only secret | Shared webhook authentication value |
| `RESEND_API_KEY` | Server-only secret | Email delivery |
| `RESEND_FROM_EMAIL` | Server-only | Verified sender used by forecast emails |
| `ADMIN_CONTACT_EMAIL` | Server-only config | Admin recipient address; production value should be `curatemystay@gmail.com` |
| `SUPABASE_SEND_EMAIL_HOOK_SECRET` | Server-only secret | Standard Webhooks secret for Supabase Auth Send Email Hook |
| `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER` | Browser-safe | Digits-only WhatsApp follow-up number |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical site origin used for auth callbacks |

## Supabase Setup

1. Create the production project.
2. Run `supabase/schema.sql`.
3. Create and test RLS policies matching [Supabase Schema](./SUPABASE_SCHEMA.md). The repository enables RLS but includes no policies.
4. Enable email/password authentication.
5. Set the Site URL and permitted redirect URL to the production `NEXT_PUBLIC_SITE_URL` and `${NEXT_PUBLIC_SITE_URL}/auth/callback`.
6. For Google OAuth, enable the Supabase Google provider. In Google Cloud, authorize the Supabase provider callback (`https://<project-ref>.supabase.co/auth/v1/callback`); in Supabase, permit the application callback URL.
7. Do not enable the Auth Send Email Hook until `/api/auth/send-email-hook` is deployed with `SUPABASE_SEND_EMAIL_HOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_SUPABASE_URL` configured.

### Manual production database checks

1. Run the read-only owner payout duplicate query in [Payout Logic](./PAYOUT_LOGIC.md). Only when it returns no rows, create `owner_payouts_owner_month_unique` on `(owner_id, month)` using the documented SQL.
2. Configure `SUPABASE_SERVICE_ROLE_KEY` with a real server-only `sb_secret_...` key or legacy JWT whose role is `service_role`. Never use an anon/publishable key in this variable.
3. Verify the current `contact_submissions` RLS state and policies:

```sql
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'contact_submissions';

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'contact_submissions'
order by policyname;
```

4. After the valid service-role configuration is deployed, manually enable RLS if the first query reports `false`:

```sql
alter table public.contact_submissions enable row level security;
```

5. Re-run the verification queries. Keep public SELECT, UPDATE, and DELETE unavailable. No anonymous INSERT policy is required when both lead routes use the configured service-role key.
6. Verify the `storage.objects` policies allow active admins to delete objects in the `property-images` bucket; property deletion reports a warning rather than failing if Storage cleanup is denied.

## Protected Admin

1. Create the admin user in Supabase Auth.
2. Ensure `profiles.id` equals the Auth user ID.
3. Set role `admin`, status `active`, and `is_protected = true`.
4. Verify the configured protected address matches the application constant or use the protected flag.
5. Confirm the user can access `/dashboard` and cannot be deleted or demoted through the UI/action.

## Resend

1. Verify the production sending domain in Resend.
2. Set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` value.
3. Set the admin recipient address to `curatemystay@gmail.com` for production.
4. Test both proposal-success and proposal-failure admin emails.
5. Test owner link-only delivery after successful PDF generation.
6. Test owner query notification delivery by creating a normal owner query and confirming the admin email reaches `ADMIN_CONTACT_EMAIL`.
7. After deploying `/api/auth/send-email-hook`, enable the Supabase Auth Send Email Hook with its generated secret stored in `SUPABASE_SEND_EMAIL_HOOK_SECRET`, then test signup, recovery, invite, magic link, email change, and reauthentication emails.

The `/api/contact` route uses `RESEND_FROM_EMAIL` when configured and falls back to the Resend development sender only when it is absent. Set and verify a production sender for general contact delivery.

## Google Apps Script Proposal Service

1. Deploy an Apps Script web app that accepts authenticated JSON POST requests.
2. Configure the script's presentation template and Drive output folder inside the Apps Script project. Their IDs/configuration are external and are not stored in this repository.
3. Ensure the template supports the replacement keys sent by `proposal-generator.ts`.
4. Return flat JSON containing `ok`, `pdfDownloadUrl`, and `pdfViewUrl`.
5. Ensure generated PDF links are accessible to intended recipients.
6. Set the same strong secret in Apps Script and `APPS_SCRIPT_SECRET`; set the deployment URL in `APPS_SCRIPT_WEBHOOK_URL`.

The application intentionally allows the Apps Script request to use the route/platform lifecycle because generation may take longer than 30 seconds.

## Hosting

1. Add every environment variable to the hosting provider; use production scope where supported.
2. Keep server-only values out of client-exposed variable names.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin without a trailing callback path.
4. Configure the digits-only WhatsApp number including country code.
5. Build with:

```bash
npm run build
```

Use the provider's standard Next.js start/runtime command.

## Post-Deployment Smoke Tests

- Homepage and mobile menu render without console/CSS errors.
- Signup creates a pending owner; pending and inactive redirects work.
- Supabase Auth Send Email Hook emails deliver through Resend after the deployed hook endpoint returns 200.
- Email/password and Google login reach the correct dashboard.
- Owner cannot access admin routes and admin cannot enter owner routes as the wrong role.
- Admin can manage a property, booking, and both expense types.
- Owner sees only assigned properties/bookings/property expenses.
- Current-month owner performance matches between `/owner` and `/owner/payout`.
- Previous-month payout generation, review-window action, query resolution, and mark-paid behavior work.
- Creating an owner query succeeds, shows the owner success toast, and sends an internal admin email to `ADMIN_CONTACT_EMAIL`.
- Forecast returns before proposal generation completes.
- Successful proposal enables `pdfDownloadUrl`, sends admin email, and sends the owner link-only email.
- Failed proposal leaves the forecast visible and sends no owner email.
- Contact and forecast lead inserts appear in `contact_submissions`.

## Secret Rotation

1. Generate the replacement credential at its provider.
2. Update the hosting environment without committing it.
3. For Apps Script, update both sides of the shared secret before testing.
4. Redeploy or restart the application as required by the host.
5. Run the affected smoke tests.
6. Revoke the old credential after successful verification.

If any credential was committed, rotate it first, remove it from Git history, and only then push again. Adding the path to `.gitignore` does not remove a secret from existing commits.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| User redirected unexpectedly | Profile role/status, Auth session cookies, `NEXT_PUBLIC_SITE_URL`, callback allowlist |
| Owner sees no data | Property `owner_id`, profile/Auth ID match, RLS policies |
| Public lead insert fails | Valid server-only `sb_secret_` or legacy `service_role` key; `sb_publishable_` and legacy anon JWTs are rejected; `contact_submissions` RLS state |
| Forecast works but deck fails | Apps Script URL/secret, deployment access, template/output-folder config, response fields |
| Deck exists but UI says unavailable | Response must have `ok: true` and a valid `pdfDownloadUrl` |
| Email fails | Resend key, verified sender/domain, recipient, provider logs |
| Auth emails stop sending after hook enablement | Deployed `/api/auth/send-email-hook`, `SUPABASE_SEND_EMAIL_HOOK_SECRET`, Standard Webhooks signature headers, Resend credentials, and Supabase hook URL |
| Styling appears corrupted | Remove stale generated Next caches inside the repository; do not keep renamed `.next` folders unless ignored |
| Second dev server refuses to start | Stop the existing Next process for this checkout before restarting |
