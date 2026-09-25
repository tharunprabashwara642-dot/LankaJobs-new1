# LankaJobs

Native Expo job discovery and job-posting foundation for Sri Lankan job seekers and employers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/lanka-jobs/app/` — Expo Router screens and tab navigation.
- `artifacts/lanka-jobs/data/jobs.ts` — typed job model, categories, and replaceable demo listing source.
- `artifacts/lanka-jobs/context/AppContext.tsx` — local saved-job, draft-job, and language persistence.
- `artifacts/lanka-jobs/constants/colors.ts` — LankaJobs visual tokens.
- `artifacts/lanka-jobs/assets/images/icon.png` — generated app icon.

## Architecture decisions

- The first mobile build is frontend-first and uses AsyncStorage for a testable local shortlist and draft flow; production user/job ownership must move to the shared backend before account actions are enabled.
- Demo jobs are typed data in one replaceable source, not embedded in screen components.
- Secure authentication is intentionally not faked. The sign-in surface documents the pending phone OTP/Google connection rather than creating local accounts.
- Normal job posting is free; the current posting form saves a clearly labeled local draft and does not publish or simulate moderation.

## Product

LankaJobs lets people browse Sri Lankan job listings, search and filter by title/company/location/category/work mode, open job details, save a local shortlist, change the app language, and explore the employer posting foundation. The mobile UI is ready for backend/auth integration without presenting unavailable capabilities as live.

## User preferences

- English is the default language; Sinhala and Tamil are represented in Settings for the localization pass.

## Gotchas

- Do not add fake authentication, payment confirmation, moderation, or push notifications. Connect those through the backend/integration layer first.
- Expo preview runs through the managed `artifacts/lanka-jobs: expo` workflow and can be scanned from the Preview on your phone flow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
