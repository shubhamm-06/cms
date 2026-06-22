# Owner Payout Logic

The operational payout system uses real bookings, property expenses, property share percentages, and stored payout history. It is separate from the public estimate in [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md).

## Live Performance vs Payable Statement

| Concept | Current-month live performance | Previous-month payable payout |
| --- | --- | --- |
| Period | Current calendar month | Previous completed calendar month |
| Storage | Calculated live; no payout row created | Stored in `owner_payouts` |
| Purpose | Informational owner dashboard estimate | Reviewable monthly statement |
| Actions | None | Approve/query when eligible |

`/owner` and the top of `/owner/payout` use the same `calculateOwnerLivePerformance` helper and `OwnerLivePerformancePanel`. The `/owner/payout` history table contains all stored owner statements, latest month first, including the latest payable previous-month row.

## Revenue Window

Revenue is prorated by nights falling within the target calendar month:

- Check-in is inclusive.
- Check-out is exclusive.
- Cross-month stays count only overlapping nights.
- Cancelled and blocked bookings contribute zero.
- Stored positive `nightly_rate` is preferred.
- Otherwise, nightly rate falls back to `total_amount / booking nights`.
- If stored nights are unavailable, booking date difference is used.

```txt
monthly_booking_revenue = effective_nightly_rate x overlapping_nights
```

## Expenses

Only `expense_for = property` rows dated in the target month and linked to the owner's active properties are deducted. CMS expenses are excluded from live performance and payable payouts.

## Property and Combined Calculations

For each active property:

```txt
property_net = property_revenue - property_expenses
```

The application stores one combined owner-month payout row. For multi-property owners, the admin payout page calculates and displays property-wise breakup live; the owner payout page currently shows only the combined history table.

```txt
revenue_total = sum(property revenue)
expense_total = sum(property expenses)
current_month_net = revenue_total - expense_total
adjusted_net_profit = current_month_net + previous_carry_forward
```

The stored `property_id` is the owner's first active property as a representative value required by the unchanged schema.

## Negative Carry-Forward

Prior months before the target month are processed in month order. Carry-forward remains at most zero:

```txt
carry = min(0, carry + (prior revenue_total - prior expense_total))
```

If adjusted net profit is zero or negative:

- Owner share, CMS share, TDS, and final payout are zero.
- The negative adjusted amount carries forward.

## Owner and CMS Share

For a positive adjusted net profit, the owner percentage is weighted by positive property net contributions:

```txt
owner_share_percent =
  sum(max(0, property_net) x property.owner_share)
  / sum(max(0, property_net))

cms_share_percent = 100 - owner_share_percent
```

If no property has positive net, the first property owner share is the fallback; if there is no property, the fallback is 70%. Property validation and the database constraint require owner share plus CMS share to equal 100.

```txt
owner_share_amount = adjusted_net_profit x owner_share_percent
cms_share_amount = adjusted_net_profit x cms_share_percent
tds_amount = owner_share_amount x 10%
final_payout_amount = owner_share_amount - tds_amount
```

Money calculations round to two decimals. TDS is fixed at 10% and is not editable.

## Creation and Recalculation

- Loading `/dashboard/payouts` processes all active owners for the previous month.
- Loading `/owner/payout` processes only the authenticated owner.
- Existing `draft` and `ready_for_review` rows may be recalculated.
- Existing `approved`, `query_raised`, `resolved`, and `paid` rows are preserved.
- There is no scheduler or background job; processing depends on page loads.

## Status Lifecycle

| Status | Meaning |
| --- | --- |
| `draft` | Schema default/transitional status; current page-load generation normally sets ready-for-review on days 1-5 or approved after day 5 |
| `ready_for_review` | Available for owner action during days 1-5 |
| `approved` | Owner approved, or page-load processing auto-approved after day 5 |
| `query_raised` | Owner created a linked payout query |
| `resolved` | Admin resolved the linked query |
| `paid` | Admin marked an approved/resolved payout paid |

### Review Window

From calendar day 1 through 5, an owner may approve or raise a query only when:

- the row belongs to that owner;
- status is `ready_for_review`; and
- the server confirms the review window is open.

After day 5, page-load processing auto-approves untouched previous-month draft/ready rows and records `approved_at`. There is no automatic process unless a payout page loads.

### Query Workflow

Raising a query creates an open `owner_queries` row linked to the payout and changes payout status to `query_raised`. Admin resolution marks the query resolved and moves the payout to `resolved`. Admin deletion of a linked query restores the payout to `ready_for_review` during days 1-5 or `approved` after the review window; failed query deletion attempts restore the prior queried state.

### Mark Paid

Only admin can mark a payout paid, and only from `approved` or `resolved`. The action sets status to `paid` and records `paid_at`.

## Owner-Facing Rules

- `paid` and `approved` both display as **Approved** to owners.
- Ready, queried, and resolved statuses remain visible with owner-facing labels.
- The owner history table does not filter to paid rows and has no search input.
- Approve/query actions appear only on eligible rows.
- Owners do not see CMS expenses, admin notes, other owners' data, or editable payout fields.

## Current Limitations

- Processing is page-load driven rather than scheduled.
- The schema has no unique `(owner_id, month)` constraint; application code performs the duplicate check.
- Owner statement PDF export is not implemented.
