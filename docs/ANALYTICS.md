# CurateMyStay Analytics Tracking

## Purpose

CurateMyStay uses analytics to understand which marketing sources, campaigns, and homepage CTAs bring prospective Goa property-owner leads.

Primary funnel:

```txt
Campaign / organic visitor
→ Homepage CTA
→ Forecast form interaction
→ Forecast lead submitted
→ Pitch deck generated
→ Pitch deck downloaded
→ WhatsApp or Calendly follow-up
```

The primary business conversion is:

```txt
generate_lead
```

This fires only after `POST /api/owner-forecast` succeeds and the forecast result is accepted by the browser.

---

## Current Status

### Confirmed Working

```txt
GTM is installed globally on the website.
GA4 base tracking is live.
GA4 Realtime confirmed website traffic is being received.
Homepage funnel events are being pushed to window.dataLayer.
calendar_click was fully tested through GTM Preview and sent successfully to GA4. The homepage now keeps this event name while opening Calendly in an on-site popup.
```

### Pending Final Action

The current GTM workspace includes the public funnel event setup and was tested in Preview.

Publish the workspace version before treating funnel-event tracking as live:

```txt
Version name: Public funnel event tracking

Description:
Added GA4 tracking for calendar, WhatsApp, forecast funnel, pitch-deck readiness and PDF downloads with safe CTA context parameters.
```

After publishing, mark `generate_lead` as a GA4 key event.

---

## Analytics Architecture

```txt
Next.js application
  ↓
src/lib/analytics.ts
  ↓
window.dataLayer.push(...)
  ↓
Google Tag Manager
  ↓
Google Analytics 4
```

The application does not load GA4 directly.

GTM controls GA4 delivery and will also be the central place for future Meta Pixel, LinkedIn Insight Tag, Microsoft Clarity, Google Ads, and consent configuration.

---

## IDs and Environment Setup

```txt
Website: https://curatemystay.net
GTM Container ID: GTM-MSP4GL22
GA4 Measurement ID: G-27JT5KQX4C
```

### Local Environment Variable

Add to `.env.local`:

```env
NEXT_PUBLIC_GTM_ID=GTM-MSP4GL22
```

### Vercel Environment Variable

Add the same value in Vercel:

```txt
Project Settings
→ Environment Variables
→ NEXT_PUBLIC_GTM_ID
→ GTM-MSP4GL22
→ Production
```

Do not add the GA4 Measurement ID separately to `.env.local`. GA4 is managed inside GTM.

---

## Application Implementation

### Relevant Files

```txt
app/layout.tsx
src/lib/analytics.ts
components/home/reference-home.tsx
docs/ANALYTICS.md
docs/AI_PROJECT_CONTEXT.md
docs/CHANGELOG.md
docs/INDEX.md
```

### GTM Base Loading

GTM is loaded globally through:

```txt
app/layout.tsx
```

Rules:

```txt
Uses NEXT_PUBLIC_GTM_ID only.
Uses next/script.
Includes the standard GTM noscript iframe fallback.
Renders nothing when NEXT_PUBLIC_GTM_ID is missing.
Does not load GA4 directly.
Does not hardcode campaign or analytics IDs in homepage components.
```

### Event Helper

Public marketing events are sent through:

```txt
src/lib/analytics.ts
```

Rules:

```txt
Use the existing helper for future public marketing events.
Do not add raw dataLayer pushes across random components.
Do not call gtag directly.
Do not install a separate analytics package unless explicitly required.
Do not send personal or identifying data.
```

### Homepage Funnel

The public acquisition homepage and forecast funnel are implemented in:

```txt
components/home/reference-home.tsx
```

The forecast API remains the source of truth for real leads:

```txt
POST /api/owner-forecast
```

The pitch-deck generation flow is separate:

```txt
POST /api/owner-forecast/proposal
```

---

## Privacy Rule

No PII is sent to `window.dataLayer`, GTM, GA4, or future advertising tags.

Never send:

```txt
Names
Emails
Phone numbers
Property addresses
Raw property details
Raw form values
Forecast values linked to a person
WhatsApp number
WhatsApp pre-filled message
PDF URLs
Full URLs containing personal data
UTM values as event parameters
gclid, fbclid, gbraid, or wbraid
Cookies
Session identifiers
Any identifying information
```

Actual owner lead details remain in the server-side flow:

```txt
POST /api/owner-forecast
→ contact_submissions
```

Analytics measures anonymous behavior only.

---

## Event Reference

| Event                   | When it fires                                                       | Allowed parameters                 | Business meaning              |
| ----------------------- | ------------------------------------------------------------------- | ---------------------------------- | ----------------------------- |
| `calendar_click`        | Visitor clicks a Calendly booking CTA                               | `cta_location`, `destination_type` | Appointment intent            |
| `whatsapp_click`        | Visitor clicks a public WhatsApp CTA, including the shared floating icon | `cta_location`, `destination_type` | Conversation intent           |
| `forecast_form_open`    | Visitor clicks an existing CTA that takes them to the forecast form | `cta_location`, `form_name`        | Forecast interest             |
| `forecast_form_started` | First forecast form interaction per page view                       | `form_name`, `form_step`           | Serious form engagement       |
| `generate_lead`         | Valid forecast request succeeds and result is displayed             | `form_name`, `lead_type`           | **Primary lead conversion**   |
| `pitch_deck_ready`      | Proposal succeeds with `ok === true` and a valid `pdfDownloadUrl`   | `lead_type`                        | Successful deck generation    |
| `pitch_deck_download`   | Visitor clicks ready-state PDF download CTA                         | `cta_location`, `asset_type`       | Lead engagement               |
| `login_cta_click`       | Direct homepage CTA routes to `/login`                              | `cta_location`                     | Reserved, not currently wired |
| `signup_cta_click`      | Direct homepage CTA routes to `/signup`                             | `cta_location`                     | Reserved, not currently wired |

### Current Shared Parameter Values

```txt
destination_type = calendly | whatsapp
form_name = owner_forecast
lead_type = pitch_deck_forecast
asset_type = pitch_deck_pdf
```

### Current `cta_location` Values

```txt
header
mobile_menu
about_page
faq_page
property_management_proposal
hero
math_comparison
forecast_result
testimonials
tier_card
tiers
investment_accordion
footer_cta
footer
floating_whatsapp
property_page_enquiry_card
property_page_managed_by
property_page_mobile_bar
booking_hero
```

### Example Event Payload

```js
{
  event: "calendar_click",
  cta_location: "hero",
  destination_type: "calendly"
}
```

---

## Google Tag Manager Setup

## 1. GA4 Base Tag

```txt
Tag name: GA4 - Base Tag
Tag type: Google tag
Measurement ID: G-27JT5KQX4C
Trigger: Initialization - All Pages
```

Purpose:

```txt
Loads GA4 configuration and standard page-view tracking across the website.
```

---

## 2. Funnel Event Trigger

```txt
Trigger name: TR - CMS - Public Funnel Events
Trigger type: Custom Event
Use regex matching: enabled
Trigger firing condition: All Custom Events
```

Event regex:

```txt
^(calendar_click|whatsapp_click|forecast_form_open|forecast_form_started|generate_lead|pitch_deck_ready|pitch_deck_download|login_cta_click|signup_cta_click)$
```

---

## 3. Funnel GA4 Event Tag

```txt
Tag name: GA4 - CMS - Public Funnel Events
Tag type: Google Analytics: GA4 Event
Measurement ID: G-27JT5KQX4C
Event Name: {{Event}}
Trigger: TR - CMS - Public Funnel Events
```

`{{Event}}` is the GTM built-in variable. It dynamically resolves to the actual event name.

Examples:

```txt
calendar_click
whatsapp_click
generate_lead
pitch_deck_download
```

---

## 4. GTM Data Layer Variables

All variables use:

```txt
Data Layer Variable Version: Version 2
```

| GTM Variable Name        | Data Layer Variable Name |
| ------------------------ | ------------------------ |
| `DLV - cta_location`     | `cta_location`           |
| `DLV - destination_type` | `destination_type`       |
| `DLV - form_name`        | `form_name`              |
| `DLV - form_step`        | `form_step`              |
| `DLV - lead_type`        | `lead_type`              |
| `DLV - asset_type`       | `asset_type`             |

---

## 5. GA4 Event Parameters in GTM

Add these rows to:

```txt
GA4 - CMS - Public Funnel Events
```

| GA4 Parameter Name | GTM Value                    |
| ------------------ | ---------------------------- |
| `cta_location`     | `{{DLV - cta_location}}`     |
| `destination_type` | `{{DLV - destination_type}}` |
| `form_name`        | `{{DLV - form_name}}`        |
| `form_step`        | `{{DLV - form_step}}`        |
| `lead_type`        | `{{DLV - lead_type}}`        |
| `asset_type`       | `{{DLV - asset_type}}`       |

It is normal for unrelated parameters to be empty.

Example:

```txt
calendar_click
→ cta_location and destination_type populated
→ form_name, form_step, lead_type, asset_type empty
```

---

## GTM Preview Testing

Use GTM Preview after any analytics code or GTM change.

### Standard Test Procedure

1. Open Google Tag Manager.
2. Click Preview.
3. Enter:

```txt
https://curatemystay.net
```

4. Use the connected CurateMyStay website window.
5. Perform one action.
6. Return to Tag Assistant.
7. Select the event under the blue CurateMyStay session.
8. Confirm `GA4 - CMS - Public Funnel Events` fired.
9. Check Data Layer and sent-hit details.

### Minimum Funnel Test List

```txt
Calendar CTA → calendar_click
WhatsApp CTA → whatsapp_click
Forecast CTA → forecast_form_open
First forecast input interaction → forecast_form_started
Valid forecast submission → generate_lead
Successful pitch-deck generation → pitch_deck_ready
Pitch-deck download click → pitch_deck_download
```

### Verified Calendar Test

The following payload was confirmed in GTM Preview:

```js
{
  event: "calendar_click",
  cta_location: "hero",
  destination_type: "calendly"
}
```

The GA4 event tag fired successfully and the sent GA4 hit used:

```txt
Event Name: calendar_click
Measurement ID: G-27JT5KQX4C
```

### Calendly Popup Note

All public booking CTAs use the shared on-page Calendly popup with `https://calendly.com/curatemystay/30min?hide_gdpr_banner=1`. The shared public navbar reuses the same helper on `/`, `/about`, `/faq`, and `/property-management-proposal`; the homepage uses `header`, while the newer public pages use their existing page-safe `about_page`, `faq_page`, and `property_management_proposal` CTA locations. The homepage loads the Calendly script and stylesheet once, uses no floating badge, and does not redirect to another page. Each genuine CTA click emits one `calendar_click` event with the existing non-PII `cta_location` and `destination_type: calendly`; no name, email, phone, Calendly form value, full URL, cookie, or UTM value is sent through analytics.

---

## GA4 Reporting and Conversion Setup

### Primary Key Event

After GTM funnel tracking is published and `generate_lead` appears in GA4:

```txt
GA4 Admin
→ Events
→ generate_lead
→ Mark as key event
```

Use `generate_lead` as the main conversion for paid campaign optimisation.

### Secondary Engagement Signals

These are useful for diagnosing campaign performance but should not initially be the main ad-platform optimisation event:

```txt
calendar_click
whatsapp_click
forecast_form_open
forecast_form_started
pitch_deck_ready
pitch_deck_download
```

### Weekly Review

```txt
Users by source / medium
Campaign performance
Landing page performance
Forecast form opens
Forecast form starts
Generate lead count
Form-start to lead conversion rate
Calendar clicks
WhatsApp clicks
Pitch-deck ready rate
Pitch-deck download rate
```

---

## Campaign Link Standards

Use UTMs for manually shared social, referral, and partnership links.

Example:

```txt
https://curatemystay.net/?utm_source=instagram&utm_medium=paid_social&utm_campaign=goa_owner_leads_july&utm_content=villa_reel_01
```

Suggested conventions:

```txt
Instagram ads:
utm_source=instagram
utm_medium=paid_social

LinkedIn ads:
utm_source=linkedin
utm_medium=paid_social

Instagram organic:
utm_source=instagram
utm_medium=organic_social

LinkedIn organic:
utm_source=linkedin
utm_medium=organic_social

Referral partner:
utm_source=partner_or_broker_name
utm_medium=referral
```

For Google Ads:

```txt
Use Google Ads auto-tagging.
Link Google Ads with GA4.
Import generate_lead as the primary conversion after it is active and verified.
```

### Current Limitation

Campaign attribution is currently visible in GA4, but first-touch and last-touch attribution is not yet stored in `contact_submissions`.

Do not claim lead-level attribution is stored in Supabase until this is implemented.

---

## Planned but Not Yet Configured

```txt
Google Ads linking and conversion import
Google Search Console setup and GA4 linking
Microsoft Clarity
Meta Pixel
LinkedIn Insight Tag
Cookie consent banner
Google Consent Mode v2
Supabase first-touch / last-touch attribution storage
```

---

## Rules for Future Changes

Before changing analytics:

```txt
Read this document.
Read docs/AI_PROJECT_CONTEXT.md.
Inspect src/lib/analytics.ts.
Inspect components/home/reference-home.tsx.
Use GTM Preview before publishing.
```

When adding a new marketing CTA:

```txt
1. Use the existing analytics helper.
2. Reuse an existing event where appropriate.
3. Add a new event only when it has a clear business reporting need.
4. Send safe stable parameters only.
5. Add new events to the GTM trigger regex.
6. Add GTM variables and GA4 parameters only where needed.
7. Test through GTM Preview.
8. Update this document, docs/AI_PROJECT_CONTEXT.md, and docs/CHANGELOG.md.
```

Avoid:

```txt
Direct GA4 code inside components
Hardcoded GTM or GA4 IDs in components
Multiple GA4 tags for the same event
PII in dataLayer parameters
New events for insignificant visual interactions
Changing forecast API behavior for analytics-only work
```

---

## Troubleshooting

### Tag Assistant does not show calendar_click after a booking click

Cause:

```txt
The CurateMyStay page session or booking click was not selected in Preview.
```

Fix:

```txt
Select the CurateMyStay website session and inspect the calendar_click event fired before the Calendly popup opened.
```

### GTM says unknown Data Layer Variable

Cause:

```txt
A GA4 event-tag parameter references a GTM variable name that does not exist exactly.
```

Fix:

```txt
Check User-Defined Variables.
Ensure all six DLV variables exist with exact names.
Save variables, then reopen and save the GA4 event tag.
```

### GTM configuration shows Event rather than calendar_click

This is normal.

`Event` is the GTM built-in variable label. Confirm the actual resolved value from the GA4 sent hit in Tag Assistant:

```txt
Event Name: calendar_click
```

### Event is visible in dataLayer but GA4 tag does not fire

Check:

```txt
The event name matches the trigger regex.
Use regex matching is enabled.
The tag uses TR - CMS - Public Funnel Events.
The tag was saved.
The GTM workspace version was published.
```

---

## Source of Truth

```txt
Application event behavior:
src/lib/analytics.ts
components/home/reference-home.tsx

GTM configuration:
GTM-MSP4GL22

GA4 property:
G-27JT5KQX4C

Documentation:
docs/ANALYTICS.md
```
