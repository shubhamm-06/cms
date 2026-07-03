# UI Conventions

CurateMyStay keeps UI code simple, Tailwind-first, and easy to edit later.

1. Tailwind handles layout, spacing, responsiveness, and page styling.
2. shadcn/ui source components in `components/ui` are selectively reused primitives, not a full design-system rewrite.
3. Business forms remain in `components/forms` and retain their current server-action flows.
4. Toasts are for success/failure feedback; delete actions require `AlertDialog` confirmation.
5. Existing server-action forms keep native selects unless a specific future task safely changes one.
6. Tables continue using TanStack Table through the existing table components.
7. Mobile table default is controlled horizontal scrolling unless a specific screen needs a separate mobile layout.
8. Avoid generic abstractions that make future human edits harder.
9. Dashboard navigation active states use exact or segment-bound route matching, set `aria-current="page"`, and should never highlight more than one item.
10. Admin UI should remain efficient, dense, and operational for repeated back-office work.
11. Owner UI should be slightly more polished, calm, and user-friendly because owners are the main product-facing users.
12. Admin create/edit pages can show success toasts through small page-specific notice codes after server-action redirects; remove the notice from the URL after the toast displays.
13. Destructive table actions should confirm the selected record name and a concise operational impact note before submitting the existing server action.
14. Booking form feedback stays booking-specific: use allowlisted notice codes, preserve local date/night/rate/amount helpers, and keep destructive booking deletes behind `AlertDialog`.
15. Expense form feedback stays expense-specific: use allowlisted notice codes, keep CMS/property select behavior intact, and confirm expense deletes with category, amount, and context.
16. User-management feedback stays user-specific: keep protected-admin role/status controls locked, use row-level pending save states, and confirm user deletes by name/email.
17. Owner dashboards should prioritize calm hierarchy: current-month performance first, latest statement next, recent activity after that, and slower-changing property reference details lower on the page.
18. Owner payout pages should clearly separate informational current-month live figures from reviewable stored statements, keep owner-facing status badges no-wrap, and keep eligible payout actions compact and explicit.
19. Owner financial summaries that are not payout records must be labeled plainly, avoid owner-share/CMS/TDS language, and use compact read-only metric cards.
20. Admin overview pages should prioritize fast scanning: compact context first, KPI cards next, then operational tables/lists with restrained color and clear empty states.
21. Owner read-only reference pages should make scope and immutability clear, use calm summary cards, and never expose admin edit controls.
