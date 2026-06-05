# Sentry Frontend Certification

## Scope

Configured Sentry for the Next.js frontend only.

- Sentry org: `holding-ay`
- Sentry project: `javascript-nextjs`
- Backend untouched
- Product UX unchanged outside the global crash fallback

## Files Added / Updated

- `C:\Users\Administrador\Documents\New project\repo-main-merge\next.config.mjs`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\instrumentation-client.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\instrumentation.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\sentry.server.config.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\sentry.edge.config.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\global-error.tsx`

## Environment Variables

Required:

- `NEXT_PUBLIC_SENTRY_DSN`

Optional for sourcemap uploads:

- `SENTRY_AUTH_TOKEN`

Optional explicit environment override:

- `SENTRY_ENVIRONMENT`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`

### Production expectation

Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel Production.

If sourcemaps are desired, set `SENTRY_AUTH_TOKEN` in Vercel Production as a server-side secret only.

## Behavior

- Client, server, and edge runtimes initialize Sentry only when `NEXT_PUBLIC_SENTRY_DSN` is present.
- Environment defaults to `production`.
- Sourcemap upload is disabled automatically when `SENTRY_AUTH_TOKEN` is absent.
- Unhandled App Router global crashes are captured through `app/global-error.tsx`.
- Request/runtime errors are captured through `instrumentation.ts`.

## Safe test mechanism

No public test page was added.

Reason:

- this is a production launch-oriented frontend
- adding a visible crash/test route was unnecessary risk
- the global error and instrumentation setup is enough for first deployment validation

## Build

- `npm run build` required

## Decision

`B) frontend Sentry configured`
