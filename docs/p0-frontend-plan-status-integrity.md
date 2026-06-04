# P0 Frontend — Plan Status Mapping Integrity

Fecha: 2026-06-04

## Objetivo

Evitar que el frontend muestre un plan pagado como activo cuando el backend realmente está en un estado no activo como `pending_payment`.

## Hallazgo principal

El problema estaba en dos capas:

1. `app/api/dashboard/status/route.ts`
   - el endpoint derivaba `trialing` solo por `plan_code === trial`
   - eso podía ocultar un `subscription_status = pending_payment`
   - resultado: el widget podía recibir un `status` aparentando trial activo aunque la suscripción estuviera pendiente

2. `components/dashboard/PlanStatusWidget.tsx`
   - el badge verde `Activo` se usaba para cualquier estado considerado “activo” por el helper
   - no existía presentación explícita para:
     - `pending_payment`
     - `past_due`
     - `canceled`
     - `expired_trial`

## Fix aplicado

### Endpoint `/api/dashboard/status`

Se corrigió la derivación canónica de estado:

- `pending_payment` → `pending_payment`
- `past_due` / `failed` → `past_due`
- `cancelled` / `canceled` → `canceled`
- `expired` con plan `trial` → `expired_trial`
- `expired` con plan pago → `expired`
- `trialing` / `trial` → `trialing`
- `active` / `paid` → `active`

También se agregó `plan.subscription_status` al payload para trazabilidad explícita.

### Widget `PlanStatusWidget`

Se corrigió la UI para que:

- `pending_payment` nunca se pinte como activo
- `pending_payment` muestre `Pending Payment`
- `trialing` muestre `Trial`
- `active` muestre `Activo`
- `past_due` muestre `Pago vencido`
- `canceled` muestre `Cancelado`
- `expired_trial` muestre `Trial vencido`

## Contrato validado

Estados ahora tratados explícitamente:

- `pending_payment`
- `trialing`
- `active`
- `past_due`
- `canceled`
- `expired_trial`

## Regla operativa cerrada

`pending_payment` != `active`

El frontend ya no debe mostrar un plan pago activo hasta que el backend devuelva realmente `active`.

## Archivos tocados

- `app/api/dashboard/status/route.ts`
- `components/dashboard/PlanStatusWidget.tsx`
- `lib/dashboard-status.ts`

## Decisión

**B) frontend status integrity fixed**
