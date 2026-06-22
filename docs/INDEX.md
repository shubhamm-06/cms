# Documentation Index

This is the starting point for developers and AI agents working on CurateMyStay.

## Recommended Reading Order

1. [README](../README.md)
2. [Documentation Index](./INDEX.md)
3. [AI Project Context](./AI_PROJECT_CONTEXT.md)
4. [Project Overview](./PROJECT_OVERVIEW.md)
5. [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md)
6. [Supabase Schema](./SUPABASE_SCHEMA.md)
7. Task-specific documents:
   - [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md)
   - [Payout Logic](./PAYOUT_LOGIC.md)
   - [API Contracts](./API_CONTRACTS.md)
   - [Admin Operations Guide](./ADMIN_OPERATIONS_GUIDE.md)
   - [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)
8. [Changelog](./CHANGELOG.md) only for implementation history

## Source-of-Truth Hierarchy

When sources disagree, use this order:

1. Current application source and `supabase/schema.sql`
2. Current-state documents, led by `AI_PROJECT_CONTEXT.md`
3. Task-specific documents in this index
4. Historical entries in `CHANGELOG.md`

The changelog intentionally preserves older states. Never use an old changelog entry as proof of current behavior without checking current documentation or source.

## Task Map

| Work | Read first |
| --- | --- |
| Understand the whole application | [AI Project Context](./AI_PROJECT_CONTEXT.md) |
| Modify payout logic or workflow | [Payout Logic](./PAYOUT_LOGIC.md), then payout source files |
| Modify the forecast calculator | [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md) |
| Modify the public forecast funnel or APIs | [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md) and [API Contracts](./API_CONTRACTS.md) |
| Modify routes, roles, or permissions | [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md) and [Supabase Schema](./SUPABASE_SCHEMA.md) |
| Modify admin workflows | [Admin Operations Guide](./ADMIN_OPERATIONS_GUIDE.md) |
| Configure locally | [Setup](./SETUP.md) |
| Deploy or rotate secrets | [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md) |
| Review why something changed | [Changelog](./CHANGELOG.md) |

## Document Roles

| Document | Purpose |
| --- | --- |
| `AI_PROJECT_CONTEXT.md` | Canonical technical handoff and current implementation state |
| `PROJECT_OVERVIEW.md` | Non-technical product and Phase 1 overview |
| `ROUTES_AND_PERMISSIONS.md` | Route access and security behavior |
| `SUPABASE_SCHEMA.md` | Data model, constraints, ownership, and RLS responsibilities |
| `OWNER_FORECAST_CALCULATOR.md` | Exact public forecast rules |
| `PAYOUT_LOGIC.md` | Operational owner payout rules and lifecycle |
| `API_CONTRACTS.md` | Active public HTTP endpoints and response contracts |
| `ADMIN_OPERATIONS_GUIDE.md` | Practical admin workflows |
| `DEPLOYMENT_RUNBOOK.md` | Production configuration, smoke tests, and troubleshooting |
| `SETUP.md` | Concise local setup checklist |
| `CHANGELOG.md` | Append-only historical record |
