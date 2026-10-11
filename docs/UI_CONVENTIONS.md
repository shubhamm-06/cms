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
22. Owner read-only tables should keep data scoped server-side, preserve controlled horizontal scrolling on mobile, use no-wrap status badges, and avoid admin edit/delete actions.
23. Owner support/query forms should keep native server-action flow, use route-specific success notices, show pending submit state, and avoid exposing internal admin workflow details.
24. Owner self-service profile forms should clearly separate editable contact details from read-only account fields and use route-specific success notices.
25. Admin financial tables should keep money columns right-aligned/tabular, keep statuses no-wrap, and confirm payment actions before submitting existing server actions.
26. Admin query actions should use route-specific success notices, pending resolve/delete states, and deletion confirmation that identifies linked payout-statement impact.
27. Admin financial overview pages should summarize only existing report values, keep amount columns right-aligned/tabular, and avoid adding new formulas during UI-only passes.
28. Admin settings forms should keep one-option-per-line native textareas, use route-specific success notices, and warn before removing values used by historical records.
29. Admin self-profile pages should separate editable personal contact fields from read-only account identity/status fields and use route-specific success notices.
30. `app/globals.css` sets an unlayered `a { color: inherit }`, and unlayered CSS outranks every cascade layer, so a Tailwind `text-*` utility on an `<a>` never applies. A link that must set its own colour puts the colour on a child element instead; icons then follow through `currentColor`.
31. Fully clickable public cards use one `absolute inset-0` overlay `Link` inside a `relative` card that carries the accessible name, never a wrapping link around interactive content and never a second link inside the card. Any in-card call to action becomes presentational text driven by the card's `group` hover state, and the focus ring is drawn on the card with `has-[a:focus-visible]`.
32. Public marketing copy that has no admin content mechanism stays in one typed module per section rather than inline across sibling components.
33. A custom-styled date cell keeps a real `<input type="date">` stretched across it, hides the native picker indicator, and opens the calendar from a click anywhere on the cell through a guarded `showPicker()`. Covering the cell is not enough on its own: Chromium opens the calendar only from that indicator, so an invisible full-size input leaves most of the cell dead. Do not add a date-picker package for this.
34. `app/globals.css` gives every enabled `<button>` and `[role="button"]` a pointer cursor in the base layer, because Tailwind v4's preflight leaves the default arrow. A button that must stay focusable while inert uses `aria-disabled` and keeps the default cursor. Do not add `cursor-pointer` to individual components.
35. A modal Radix `Dialog` must render a `Dialog.Overlay`: the page scroll lock, with scrollbar-width compensation, lives in the overlay, and without it the page behind keeps scrolling and a second scrollbar appears. A full-screen dialog is the only scroll container, and a lightbox stacked on it must not scroll.
36. Overlay state that the back button should close lives in the URL, one history entry per level. Pass only your own keys to `history.pushState`: spreading `history.state` copies Next.js's `__NA` marker, which makes Next.js skip the `useSearchParams` update.
37. Public catalogue colours are named tokens in `app/globals.css` (`text-public-ink`, `bg-public-coral-soft` and so on). Build new public UI from them instead of hex literals.
