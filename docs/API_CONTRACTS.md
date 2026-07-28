# Public API Contracts

These are the active public HTTP endpoints. All accept JSON and validate server-side. Raw Supabase, Apps Script, and Resend errors are not returned to clients.

## `POST /api/contact`

**Purpose:** Store a general contact enquiry and optionally notify the configured admin address.

**Authentication:** None.

### Input

```json
{
  "name": "string, minimum 2 characters",
  "email": "valid email",
  "phone": "optional string",
  "message": "string, minimum 5 characters"
}
```

The route sets `source_page = landing_page` rather than accepting it from the client.

### Responses

| Status | Shape |
| --- | --- |
| 200 | `{ "message": "Thanks. We will get back to you shortly." }` |
| 400 | `{ "message": "Please check the form fields." }` |
| 500 | `{ "message": "Could not submit the enquiry right now." }` |

### Side Effects and Secrets

- Inserts into `contact_submissions` using the service-role client when configured, otherwise the normal server client subject to RLS.
- If `RESEND_API_KEY` exists, sends an admin notification. This route currently uses the fixed Resend development sender in source rather than `RESEND_FROM_EMAIL`.
- Uses `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `ADMIN_CONTACT_EMAIL` only on the server.

## `POST /api/auth/send-email-hook`

**Purpose:** Receive signed Supabase Auth Send Email Hook requests and deliver branded authentication emails through Resend.

**Authentication:** None from the browser. Supabase must sign every request with Standard Webhooks headers: `webhook-id`, `webhook-timestamp`, and `webhook-signature`.

### Input

The route reads the raw request body first, verifies the Standard Webhooks signature with server-only `SUPABASE_SEND_EMAIL_HOOK_SECRET`, then validates the current Supabase Send Email Hook payload shape:

- `user`
- `email_data`
- supported `email_data.email_action_type`: `signup`, `recovery`, `invite`, `magiclink`, `email_change`, and `reauthentication`

### Responses

| Status | Shape |
| --- | --- |
| 200 | `{ "ok": true }` |
| 400 | `{ "ok": false }` for invalid payload or unsupported action |
| 401 | `{ "ok": false }` for invalid webhook signature |
| 500 | `{ "ok": false }` for missing server configuration or delivery failure |

### Side Effects and Secrets

- Sends the auth email through Resend using `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- Builds Supabase verification URLs from `NEXT_PUBLIC_SUPABASE_URL`, the provided token hash, action type, and a safe redirect.
- Redirects are accepted only when they are same-origin with `NEXT_PUBLIC_SITE_URL`; unsafe or malformed values fall back to the site origin.
- Email-change sends follow Supabase's official token-hash mapping: `token_hash_new` to the current email and `token_hash` to the new email.
- Tokens, token hashes, verification URLs, webhook secrets, and complete payloads are never logged or returned.

Deploy this endpoint before enabling the Supabase Auth Send Email Hook. Enabling the hook while the endpoint or `SUPABASE_SEND_EMAIL_HOOK_SECRET` is missing can interrupt auth email delivery.

## `POST /api/owner-forecast`

**Purpose:** Validate property/contact details, calculate the forecast server-side, and store the lead.

**Authentication:** None.

### Input Summary

| Field | Type |
| --- | --- |
| `propertyCategory`, `configuration` | Supported enums with category/configuration compatibility |
| `areaSqft` | Number from 100 through 20,000 |
| `location`, `beachDistance`, `poolType` | Supported enums |
| `amenities` | Unique supported amenity array |
| `furnishingStatus`, `currentlyRented` | Supported enums |
| `name`, `phone`, `email` | Validated contact fields; `phone` is normalized to E.164 (`+` plus 7-15 digits) and must be a valid international number |
| `residency` | Supported residency enum |
| `whatsappInterest` | Boolean, default false |

See [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md) for exact values and rules.

### Success

```json
{
  "forecast": {
    "annualRevenue": 0,
    "annualOperatingCost": 0,
    "annualNetProfit": 0,
    "monthly": [],
    "seasonal": {},
    "setup": {},
    "modifiers": {}
  },
  "message": "Your forecast is ready."
}
```

The numeric zeros and empty objects above illustrate shape only.

### Failures

| Status | Shape |
| --- | --- |
| 400 | `{ "message": "Please check the required forecast fields." }` |
| 500 | `{ "message": "We could not save your forecast request right now. Please try again." }` |

### Side Effects and Client Expectations

- Calculates through the server-authoritative shared calculator.
- Stores a `contact_submissions` lead with `source_page = owner_revenue_calculator`.
- Does not call Apps Script and does not send email.
- Client displays the forecast immediately after this response, then requests the proposal in the background.
- A publishable Supabase key is not treated as a service-role credential.

## `POST /api/owner-forecast/proposal`

**Purpose:** Revalidate the same payload, recalculate the forecast, generate a custom PDF through Apps Script, and send result-dependent emails.

**Authentication:** None.

**Input:** Same validated owner forecast payload as `/api/owner-forecast`.

### Success

```json
{
  "ok": true,
  "pdfDownloadUrl": "https://...",
  "pdfViewUrl": null,
  "ownerEmailSent": true
}
```

`pdfViewUrl` is either a safe HTTP/HTTPS string or `null`.

The client enters ready state only when the HTTP response succeeds, `ok === true`, and `pdfDownloadUrl` exists.

### Failures

| Status | Shape |
| --- | --- |
| 400 | `{ "message": "Please check the required proposal fields." }` |
| 503 | `{ "ok": false, "message": "Pitch deck temporarily unavailable.", "pdfDownloadUrl": null, "pdfViewUrl": null, "ownerEmailSent": false }` |

PDF URL fields can carry a safe normalized URL if Apps Script returned one, but a missing/false success condition still produces 503.

### Side Effects and Secrets

1. Recalculates the forecast server-side.
2. Calls `APPS_SCRIPT_WEBHOOK_URL` with `APPS_SCRIPT_SECRET`, a safe filename, and template replacement values.
3. Accepts only HTTP/HTTPS PDF URLs from the Apps Script response.
4. Sends the admin email after the generation attempt, with ready links or failed/unavailable status.
5. Sends a link-only owner email only when generation succeeds and `pdfDownloadUrl` exists.
6. Owner-email failure returns `ownerEmailSent = false` but does not invalidate an otherwise successful deck.

Apps Script, Resend, and Supabase credentials remain server-only.

## End-to-End Forecast Sequence

1. Browser submits the three-step form to `/api/owner-forecast`.
2. API validates, calculates, and stores the lead.
3. Browser displays the returned forecast.
4. Browser calls `/api/owner-forecast/proposal` in the background.
5. Proposal API revalidates/recalculates and calls Apps Script.
6. Admin receives details and success/failure deck status after the generation attempt.
7. On success, the owner receives a link-only email and the browser enables the PDF download.
