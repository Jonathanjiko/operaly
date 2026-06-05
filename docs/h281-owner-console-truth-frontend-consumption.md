# H.2.8.1 — Owner Console Truth Frontend Consumption

## Objective

Align the Owner Console with canonical backend truth from `/owner/console/truth` so the frontend stops inferring active paid states from stale local fields.

## Files changed

- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\api\owner\console\truth\route.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\dashboard\owner\page.tsx`

## What changed

### 1. New frontend proxy to canonical owner truth

Added:

- `/api/owner/console/truth`

This route proxies the backend canonical endpoint:

- `/owner/console/truth`

using the existing internal backend key pattern already used by other owner metrics routes.

### 2. Owner Console now prefers canonical truth when available

`app/dashboard/owner/page.tsx` still loads:

- `/api/owner/dashboard`
- `/api/owner/catalog`
- `/api/owner/targets`

but now also loads:

- `/api/owner/console/truth`

When truth is available, the frontend merges canonical truth into:

- clients
- subscriptions
- payments
- summary

This lets the console keep legacy UI structure while replacing stale commercial derivation.

### 3. Canonical status rendering

Frontend now supports and renders these owner-facing states:

- `Pending Payment`
- `Trial Active`
- `Core Active`
- `Pro Active`
- `Past Due`
- `Canceled`
- `Rejected`
- `Anomaly`

### 4. Owner-only anomaly badge

If a canonical row comes with anomaly metadata, the UI now shows:

- `Requiere revisión`
- plus the anomaly code

This is rendered in:

- payments
- subscriptions
- clients
- selected client detail

### 5. Revenue now follows canonical truth

Approved revenue no longer relies only on raw payment table statuses like `approved` or `paid`.

The frontend now counts revenue from canonical truth using:

- `counts_as_revenue` when the backend provides it
- otherwise a safer canonical status fallback

Rejected/anomalous payments are excluded from confirmed revenue.

## Validation goals addressed in frontend

### Marife

Frontend now shows the canonical status that backend sends.
If backend truth says `Pending Payment`, it will no longer be painted as active due to plan selection alone.

### Jinko

Frontend now respects canonical `Pending Payment` / `Rejected` style outcomes from truth instead of inferring from selected plan.

### Revenue integrity

- rejected payments do not count as confirmed revenue
- confirmed revenue is based on canonical truth

## Build

- `npm run build`: required

## Residual risk

This frontend is now wired to consume canonical truth, but exact public validation still depends on live backend payload shape for:

- anomaly code field naming
- canonical status field naming
- revenue confirmation flag naming

The implementation is tolerant and merges multiple likely field names, but live owner verification is still recommended.

## Decision

`B) Owner Console reflects backend truth`
