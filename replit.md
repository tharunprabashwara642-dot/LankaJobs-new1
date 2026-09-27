# LankaJobs

Native Expo job discovery and job-posting foundation for Sri Lankan job seekers and employers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run migrate` — apply checked-in SQL migrations
- Required env: `DATABASE_URL` — Postgres connection string
- API auth env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and optional `GOOGLE_SUCCESS_REDIRECT`
- Phone auth env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Mobile API env: `EXPO_PUBLIC_API_URL`
- Optional admin bootstrap env: `ADMIN_EMAIL` or `ADMIN_PHONE`
- Optional web CORS env: `WEB_ORIGIN` (comma-separated origins)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/lanka-jobs/app/` — Expo Router screens and tab navigation.
- `artifacts/lanka-jobs/data/jobs.ts` — UI job types retained for screen compatibility.
- `artifacts/lanka-jobs/context/AppContext.tsx` — API-backed job, profile, session, saved-job, and language state.
- `artifacts/admin-web/` — real admin client using the same API and database.
- `artifacts/lanka-jobs/constants/colors.ts` — LankaJobs visual tokens.
- `artifacts/lanka-jobs/assets/images/icon.png` — generated app icon.

## Architecture decisions

- Jobs, categories, profiles, saved jobs, sessions, moderation, reports, and settings are persisted through Postgres/Drizzle.
- AsyncStorage is used only for the language preference; session tokens use Expo SecureStore and the backend remains authoritative.
- Google OAuth and phone OTP are real provider integrations. The UI does not fabricate accounts or verification codes when provider configuration is absent.
- Normal job posting is free; new posts are server-side drafts and must be submitted for moderation before publication.

## Product

LankaJobs lets people browse server-backed Sri Lankan job listings, search/filter with pagination, save jobs to their account, edit a profile, get transparent profile-based recommendations, and create/moderate job drafts.

## User preferences

- English is the default language; Sinhala and Tamil are represented in Settings for the localization pass.

## Gotchas

- Do not add fake authentication, payment confirmation, moderation, or push notifications. Connect those through the backend/integration layer first.
- Payment settings are present for future configuration but seed with `postingPrice=0`, `featuredPrice=0`, `sponsoredPrice=0`, and `paymentsEnabled=false`.
- Expo preview runs through the managed `artifacts/lanka-jobs: expo` workflow and can be scanned from the Preview on your phone flow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
