# P0 Frontend — Google OAuth Real Browser Closeout

## Objective

Close the frontend side of Google OAuth so a valid Google login does not bounce back to `/login`, and new Google users without linked `client_id` metadata are routed into onboarding instead of being treated as unauthenticated.

## Audit Summary

### Frontend flow audited

- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\login\page.tsx`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\register\RegisterClient.tsx`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\auth\callback\route.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\dashboard\page.tsx`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\middleware.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\lib\supabase.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\lib\supabase\server.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\lib\client-context.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\register\setup\SetupClient.tsx`

### Root cause found

There were two separate frontend issues:

1. `login/page.tsx` sent Google OAuth directly to `/dashboard`, not to `/auth/callback`.
   - That bypassed `exchangeCodeForSession(code)`.
   - Result: the OAuth code returned to the app, but the browser session was never exchanged and persisted through the dedicated callback route.

2. `dashboard/page.tsx` treated any failure to resolve `client_id` as an unauthenticated state.
   - New Google users with a valid Supabase session but no linked `client_id` metadata were redirected to `/login`.
   - That created the observed loop: Google account chosen → app returns → login page again.

## Fix Applied

### 1. Login Google button now uses the callback route

Updated:

- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\login\page.tsx`

Change:

- Before: `redirectTo = ${window.location.origin}/dashboard`
- After: `redirectTo = /auth/callback?next=/dashboard`

This aligns login with the already-correct registration OAuth flow.

### 2. Dashboard entry now distinguishes:

- no session → `/login`
- valid session but no `client_id` → `/register/setup?plan=...`
- valid session with `client_id` → owner/professional dashboard

Updated:

- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\dashboard\page.tsx`

Behavior after fix:

- Existing Google user with linked metadata:
  - Google login → callback → session exchange → `/dashboard` → `/dashboard/professional` or `/dashboard/owner`
- New Google user without linked metadata:
  - Google login → callback → session exchange → `/dashboard` → `/register/setup?plan=trial` (or selected plan if present)

## Callback Handling Status

Verified in code:

- `app/auth/callback/route.ts` sanitizes `next`
- exchanges the code using `supabase.auth.exchangeCodeForSession(code)`
- writes cookies on the redirect response via `createSupabaseRouteClient`
- redirects to the final destination only after successful session exchange

This is the correct place for cookie/session persistence.

## Middleware / Route Guard Notes

- `middleware.ts` refreshes auth only for `/dashboard*` and `/connect-whatsapp`
- this is acceptable because `/auth/callback` itself performs the exchange and sets cookies
- the dashboard shell (`app/dashboard/professional/layout.tsx`) already sends users without `client_id` to `/register/setup`

The main missing piece was the root `/dashboard` entry page, not the professional layout.

## Environment Variables Required

Frontend / middleware:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- fallback legacy: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server endpoints:

- `SUPABASE_SERVICE_ROLE_KEY`

Backend bridge / optional registration sync:

- `OPERALY_BACKEND_URL`
- fallback legacy: `BACKEND_API_URL`
- fallback legacy: `NEXT_PUBLIC_BACKEND_URL`

## OAuth Redirect URLs That Must Exist In Supabase Auth

At minimum, production should allow:

- `https://operaly.app/auth/callback`
- `https://www.operaly.app/auth/callback`

If preview deployments are used for testing OAuth, their callback URLs must also be in Supabase Auth redirect allow-list.

## Real Browser / Production Trace

### Exact public URL reviewed

- `https://www.operaly.app/`

### What was possible from this environment

- Static frontend auth flow audit: completed
- Production page inspection: partial
- Real Google account chooser login: not completed from this environment

### Blocker for full browser certification

This environment does not have:

- an authenticated Google test account for end-to-end consent
- Playwright/browser automation package preinstalled for a true live OAuth browser replay

Because of that, I could not fully certify:

- Google account chooser selection
- final cookie presence in the browser storage after callback
- exact `/api/auth/sync-app-metadata` response during a live Google onboarding session

## What Was Validated

- callback route exists and exchanges the auth code
- login Google path now points to the callback route instead of bypassing it
- valid session without `client_id` no longer routes to `/login`
- onboarding route is now the intended destination for first-time Google users

## Build Validation

- `npm run build`: required after the fix

## Residual Risk

Low for the identified frontend bug.

Remaining residual risk is limited to production configuration and live OAuth consent path:

- Supabase redirect allow-list mismatch
- Vercel production env mismatch
- live browser cookie policy / domain issue not reproducible from local code audit alone

## Decision

`A) continue`

Reason:

The code-level frontend bug that explains the login bounce was fixed, but a true production Google-account browser run was not completed from this environment. Final closeout still requires one live browser test on:

- `https://operaly.app/login`
- Google login with a new user
- Google login with an existing user

Expected outcomes:

- new user → `/register/setup?...`
- existing user → `/dashboard/professional` or `/dashboard/owner`
- no redirect loop back to `/login`
