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
