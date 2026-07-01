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
