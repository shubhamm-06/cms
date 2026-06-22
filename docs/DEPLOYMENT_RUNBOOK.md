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
| `ADMIN_CONTACT_EMAIL` | Server-only config | Admin recipient address |
| `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER` | Browser-safe | Digits-only WhatsApp follow-up number |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical site origin used for auth callbacks |

## Supabase Setup

1. Create the production project.
2. Run `supabase/schema.sql`.
3. Create and test RLS policies matching [Supabase Schema](./SUPABASE_SCHEMA.md). The repository enables RLS but includes no policies.
4. Enable email/password authentication.
5. Set the Site URL and permitted redirect URL to the production `NEXT_PUBLIC_SITE_URL` and `${NEXT_PUBLIC_SITE_URL}/auth/callback`.
6. For Google OAuth, enable the Supabase Google provider. In Google Cloud, authorize the Supabase provider callback (`https://<project-ref>.supabase.co/auth/v1/callback`); in Supabase, permit the application callback URL.

## Protected Admin

1. Create the admin user in Supabase Auth.
2. Ensure `profiles.id` equals the Auth user ID.
3. Set role `admin`, status `active`, and `is_protected = true`.
4. Verify the configured protected address matches the application constant or use the protected flag.
5. Confirm the user can access `/dashboard` and cannot be deleted or demoted through the UI/action.

## Resend

1. Verify the production sending domain in Resend.
2. Set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` value.
3. Set the admin recipient address.
4. Test both proposal-success and proposal-failure admin emails.
5. Test owner link-only delivery after successful PDF generation.

Note: `/api/contact` currently uses the fixed Resend development sender in source, while forecast emails use `RESEND_FROM_EMAIL`. Verify that general contact delivery is acceptable for the production Resend account.

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
- Email/password and Google login reach the correct dashboard.
- Owner cannot access admin routes and admin cannot enter owner routes as the wrong role.
- Admin can manage a property, booking, and both expense types.
- Owner sees only assigned properties/bookings/property expenses.
- Current-month owner performance matches between `/owner` and `/owner/payout`.
- Previous-month payout generation, review-window action, query resolution, and mark-paid behavior work.
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
| Public lead insert fails | Valid service-role key; `sb_publishable_` is not accepted as service role; contact insertion policy |
| Forecast works but deck fails | Apps Script URL/secret, deployment access, template/output-folder config, response fields |
| Deck exists but UI says unavailable | Response must have `ok: true` and a valid `pdfDownloadUrl` |
| Email fails | Resend key, verified sender/domain, recipient, provider logs |
| Styling appears corrupted | Remove stale generated Next caches inside the repository; do not keep renamed `.next` folders unless ignored |
| Second dev server refuses to start | Stop the existing Next process for this checkout before restarting |
