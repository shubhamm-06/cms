# Analytics Tracking

CurateMyStay uses Google Tag Manager for analytics delivery. The application only pushes safe events to `window.dataLayer`; GTM controls GA4 and any advertising-platform tags.

The primary conversion event is:

```txt
generate_lead
```

This fires only after `POST /api/owner-forecast` succeeds and the forecast result is accepted by the browser.

## Privacy Rule

No PII is sent to `dataLayer`.

Do not send names, emails, phone numbers, property addresses, raw form values, full URLs, WhatsApp numbers, WhatsApp message text, UTM values, ad click IDs, cookies, or other identifying data.

## Event Reference

| Event | Trigger | Allowed parameters |
| --- | --- | --- |
| `calendar_click` | Existing Google Appointment Schedule CTA click | `cta_location`, `destination_type` |
| `whatsapp_click` | Existing public WhatsApp CTA click | `cta_location`, `destination_type` |
| `forecast_form_open` | Visitor clicks an existing CTA that takes them to the owner forecast form | `cta_location`, `form_name` |
| `forecast_form_started` | First intentional owner forecast form input interaction per page view | `form_name`, `form_step` |
| `generate_lead` | Successful `/api/owner-forecast` response displayed as a forecast | `form_name`, `lead_type` |
| `pitch_deck_ready` | Successful proposal response with `ok === true` and `pdfDownloadUrl` | `lead_type` |
| `pitch_deck_download` | Ready-state PDF download CTA click | `cta_location`, `asset_type` |
| `login_cta_click` | Homepage CTA directly routing to `/login`, if present | `cta_location` |
| `signup_cta_click` | Homepage CTA directly routing to `/signup`, if present | `cta_location` |

## Current Parameter Values

Shared values:

```txt
destination_type = google_appointment_schedule | whatsapp
form_name = owner_forecast
lead_type = pitch_deck_forecast
asset_type = pitch_deck_pdf
```

Current `cta_location` values used on the homepage:

```txt
header
mobile_menu
hero
math_comparison
forecast_result
testimonials
tier_card
tiers
investment_accordion
footer_cta
footer
booking_modal
```

## Implementation Notes

- Helper: `src/lib/analytics.ts`
- Homepage wiring: `components/home/reference-home.tsx`
- The helper safely no-ops during SSR.
- It does not require GTM to have loaded before the push.
- It strips `undefined` parameter values.
- It does not call `gtag`.
- It does not contain GTM, GA4, or advertising IDs.

## GTM Preview Checklist

Use GTM Preview after deployment or local preview with the configured container:

1. Click each calendar CTA and confirm `calendar_click` with the expected `cta_location`.
2. Click each WhatsApp CTA and confirm `whatsapp_click`.
3. Click homepage CTAs that scroll to the forecast form and confirm `forecast_form_open`.
4. Change any forecast field and confirm exactly one `forecast_form_started` event for the page view.
5. Submit a valid forecast and confirm `generate_lead` after the forecast appears.
6. Wait for proposal success and confirm `pitch_deck_ready`.
7. Click the ready PDF download button and confirm `pitch_deck_download`.
8. Confirm no event payload contains name, email, phone, address, raw form values, full URLs, WhatsApp number/message, cookies, UTMs, or click IDs.
