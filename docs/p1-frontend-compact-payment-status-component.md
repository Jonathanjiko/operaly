# P1 Frontend — Compact Payment Status Component

## Objective

Replace the oversized payment warning treatment in the dashboard with a compact payment status component that trusts the backend contract and consumes `payment.status_component` from `/api/dashboard/status`.

## Files changed

- `C:\Users\Administrador\Documents\New project\repo-main-merge\app\api\dashboard\status\route.ts`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\components\dashboard\PlanStatusWidget.tsx`
- `C:\Users\Administrador\Documents\New project\repo-main-merge\lib\dashboard-status.ts`

## What changed

### 1. `/api/dashboard/status` now returns `payment.status_component`

The route now includes a normalized compact payload:

```ts
payment: {
  status: string
  checkout_url: string | null
  status_component: {
    status_key: string
    tone: "success" | "warning" | "error" | "neutral"
    title: string
    description?: string | null
    cta_label?: string | null
    cta_href?: string | null
  }
}
```

This keeps the UI contract explicit and avoids broad client-side guessing.

### 2. `PlanStatusWidget` now consumes backend compact status first

The widget now prefers:

- `status.payment.status_component`

If the field is missing, it falls back to a safe compact component built from:

- `plan.status`
- `payment.status`
- `plan.gate_allowed`
- `payment.checkout_url`

### 3. Non-active states no longer dominate the dashboard

For inactive/commercial-blocked states, the widget now renders only a compact banner/card instead of a large warning block.

This applies to:

- `pending_payment`
- `past_due`
- `rejected`
- `expired_trial`
- unknown state

### 4. Active/trial states remain compact too

For active or trialing accounts, the widget now shows:

- a compact top status strip
- plan label/badge
- usage bars
- Google/WhatsApp summary

This keeps the signal visible without taking over the dashboard shell.

## Required states covered

### Pending Payment

- title: `Pago pendiente`
- tone: warning
- CTA: `Completar pago`

### Payment Approved / Active

- title: `Pago aprobado`
- tone: success
- no payment CTA

### Past Due

- title: `Pago vencido`
- tone: warning
- CTA: `Regularizar pago`

### Rejected

- title: `Pago rechazado`
- tone: error
- CTA: `Intentar nuevamente`

### Trial Active

- title: `Trial activo`
- tone: success
- no paid-plan wording

## Fallback safety rule

If `payment.status_component` is absent:

- the frontend falls back to a compact unknown/safe state
- it does **not** show the account as active unless:
  - `plan.gate_allowed === true`
  - and `plan.status` resolves to `active` or `trialing`

## Validation

Validated by code path and build for:

- `pending_payment`
- `active / approved`
- `rejected`
- `past_due`
- `trialing`

`npm run build`: `OK`

Note:
- local sandbox build initially failed only because Google Fonts cannot be fetched inside the restricted sandbox
- rerun outside sandbox compiled successfully

## Decision

`B) compact payment status frontend ready`
