# Owner Forecast Calculator

This document describes the public acquisition forecast implemented in `src/features/owner-forecast/forecast-calculator.ts`. It is separate from the operational owner payout system in [Payout Logic](./PAYOUT_LOGIC.md).

## Inputs and Validation

| Input | Allowed values or rule |
| --- | --- |
| Property category | Apartment, Villa |
| Configuration | Apartment: Studio, 1BHK, 2BHK, 3BHK. Villa: Studio, 1-2BHK, 3BHK, 4BHK, 5BHK+ |
| Built-up area | 100-20,000 sq.ft. |
| Location | Anjuna, Vagator, Assagao, Saligao, Calangute, Baga, Candolim, Morjim, Ashvem, Mandrem, Arambol, Panjim, Margao, Varca, Cavelossim, Colva, Loutolim, Other South Goa, Other North Goa |
| Beach distance | Less than 500m, 500m-1km, 1-2km, 2-5km, 5km+ |
| Pool | Private pool, Society/shared pool, None |
| Amenities | Any unique subset of the configured ten amenities |
| Furnishing | Fully furnished and ready; Mostly furnished, minor work; Needs significant work; Empty |
| Currently rented | No, idle; Yes, long-term; Yes, on Airbnb (self-managed); Yes, with another agency |
| Contact | Valid name, phone, email, residency, and WhatsApp-interest flag |

Category/configuration compatibility and duplicate amenities are rejected by server-side Zod validation.

## Forecast Year and Seasons

The calculation uses April through March in this order:

| Season | Months | Base occupied days per month |
| --- | --- | ---: |
| Off | April-September | 10 |
| Shoulder | October, November, February, March | 15 |
| Peak | December, January | 20 |

Month lengths are fixed in code: April 30, May 31, June 30, July 31, August 31, September 30, October 31, November 30, December 31, January 31, February 28, March 31. Leap years are not modeled.

## Base Nightly Rate Ranges

The calculator uses each range midpoint before applying modifiers.

| Property/configuration | Off | Shoulder | Peak |
| --- | ---: | ---: | ---: |
| Apartment Studio | 3,500-5,000 | 6,000-8,500 | 9,000-13,000 |
| Apartment 1BHK | 3,500-5,000 | 6,000-8,500 | 9,000-13,000 |
| Apartment 2BHK | 5,000-7,000 | 8,000-12,000 | 12,000-18,000 |
| Apartment 3BHK | 7,000-10,000 | 11,000-16,000 | 16,000-24,000 |
| Villa Studio | 4,500-6,500 | 8,000-11,000 | 12,000-17,000 |
| Villa 1-2BHK | 6,000-9,000 | 10,000-15,000 | 15,000-22,000 |
| Villa 3BHK | 8,000-12,000 | 13,000-18,000 | 18,000-28,000 |
| Villa 4BHK | 12,000-16,000 | 16,000-22,000 | 24,000-35,000 |
| Villa 5BHK+ | 18,000-25,000 | 22,000-30,000 | 35,000-50,000 |

All amounts are INR.

## Location Modifiers

| Location | Rate | Occupancy |
| --- | ---: | ---: |
| Anjuna | 1.25 | 1.05 |
| Vagator | 1.25 | 1.05 |
| Assagao | 1.30 | 1.00 |
| Saligao | 1.15 | 0.95 |
| Calangute | 1.10 | 1.10 |
| Baga | 1.10 | 1.10 |
| Candolim | 1.15 | 1.05 |
| Morjim | 1.10 | 0.90 |
| Ashvem | 1.10 | 0.88 |
| Mandrem | 1.05 | 0.85 |
| Arambol | 0.85 | 0.80 |
| Panjim | 1.00 | 1.15 |
| Margao | 0.80 | 0.85 |
| Varca | 0.95 | 0.85 |
| Cavelossim | 0.95 | 0.85 |
| Colva | 0.85 | 0.80 |
| Loutolim | 0.75 | 0.70 |
| Other South Goa | 0.80 | 0.75 |
| Other North Goa | 0.95 | 0.90 |

## Beach Distance

| Distance | Rate multiplier |
| --- | ---: |
| Less than 500m | 1.20 |
| 500m-1km | 1.10 |
| 1-2km | 1.00 |
| 2-5km | 0.90 |
| 5km+ | 0.75 |

**Panjim rule:** the applied beach multiplier cannot be below `0.95`, so Panjim uses `max(selected multiplier, 0.95)`.

## Pool Rules

| Pool | Rate uplift | Occupancy multiplier |
| --- | ---: | ---: |
| Private | 2,000 | 1.05 |
| Society/shared | 500 | 1.02 |
| None | 0 | 1.00 |

Exceptions:

- Private pool uplift is 1,000 for Apartment Studio and Apartment 1BHK.
- Villa 5BHK+ with no pool receives a `-1,500` rate uplift.

## Area Adjustment

Within the configured band, the multiplier is `1.00`. Values below/above the band use:

| Property/configuration | Band sq.ft. | Below | Above |
| --- | ---: | ---: | ---: |
| Apartment Studio / 1BHK | 400-750 | 0.90 | 1.05 |
| Apartment 2BHK | 750-1,200 | 0.92 | 1.08 |
| Apartment 3BHK | 1,100-1,800 | 0.92 | 1.08 |
| Villa Studio / 1-2BHK | 800-1,500 | 0.92 | 1.08 |
| Villa 3BHK | 1,500-2,500 | 0.93 | 1.10 |
| Villa 4BHK | 2,500-4,000 | 0.93 | 1.10 |
| Villa 5BHK+ | 3,500-6,000 | 0.95 | 1.12 |

## Amenity Bonuses

| Amenity | Bonus |
| --- | ---: |
| Garden / outdoor area | 4% |
| Gym / fitness access | 2% |
| Dedicated parking | 3% |
| BBQ / outdoor kitchen | 3% |
| Jacuzzi / hot tub | 5% |
| Home theatre / entertainment room | 3% |
| Rooftop / terrace with view | 5% |
| EV charging | 1% |
| Chef service available | 4% |
| Pet-friendly | 3% |

Bonuses add together, but the final amenity multiplier is capped at `1.15`.

## Formulas

For each season:

```txt
base_rate = midpoint(configured seasonal range)
nightly_rate = ((base_rate x location_rate x beach_multiplier) + pool_uplift)
               x area_adjustment x amenity_multiplier
```

For each month:

```txt
occupied_days = min(
  base_occupied_days x location_occupancy x pool_occupancy,
  days_in_month x 0.95
)

revenue = nightly_rate x occupied_days
operating_cost = revenue x 0.15
net_profit = revenue - operating_cost
```

Annual values are direct sums of the twelve April-March monthly rows. Seasonal revenue/cost/profit are sums of their months; seasonal occupied days is the average per month.

## Rounding and Formatting

Core calculation values remain JavaScript numbers and are not rounded inside the calculator. The UI and email/PDF adapters round currency to whole INR for display. Occupied days are displayed to at most one decimal in proposal/email output.

## Furnishing and Current Rental Status

Furnishing status does not change revenue. It adds a setup note:

| Furnishing | Setup estimate | Launch time |
| --- | --- | --- |
| Fully furnished and ready | Rs 0 | Immediate |
| Mostly furnished, minor work | Rs 25,000-Rs 75,000 | 2-4 weeks |
| Needs significant work | Rs 1,50,000-Rs 4,00,000 | 1-3 months |
| Empty | Rs 3,00,000-Rs 8,00,000+ | 2-4 months |

The note states that the forecast assumes STR readiness and does not deduct one-time setup investment. `currentlyRented`, residency, and WhatsApp interest are lead context only; they do not change the calculation.

## Explicit Exclusions

The public forecast includes only revenue, 15% operating cost, net profit, seasonal/monthly detail, modifiers, and setup guidance. It contains no owner share, CMS share, TDS, payout calculation, fixed commercial split, or long-term-rental comparison.
