# H.2.6 — Public Onboarding & Dashboard UX Correction — Part 1

## Objetivo

Corregir la semántica pública del onboarding y del dashboard principal para que:

- el dashboard no se vea sobrecargado
- el estado de plan/pago refleje el backend real
- WhatsApp no se marque como listo solo por existir un número
- el usuario entienda mejor cuál es su siguiente acción

## Cambios aplicados

### Componentes y archivos tocados

- `app/api/dashboard/status/route.ts`
- `lib/dashboard-status.ts`
- `components/dashboard/PlanStatusWidget.tsx`
- `components/dashboard/FirstActionChecklist.tsx`
- `app/dashboard/professional/page.tsx`
- `app/register/setup/SetupClient.tsx`

### 1. Contrato de `/api/dashboard/status`

Se amplió el payload frontend para incluir:

- `plan.gate_allowed`
- `payment.status`
- `payment.checkout_url`
- `whatsapp.normalized_phone`
- `whatsapp.activation_status`
- `whatsapp.welcome_sent`

La ruta ahora deriva estos campos desde Supabase sin fingir activación:

- `clients`
- `subscriptions`
- `payments`
- `client_preferences`
- `scheduled_messages`
- `google_connections`
- `usage_monthly`
- `plan_configs`

### 2. `PlanStatusWidget`

Se corrigió el mapeo visual para que:

- `pending_payment` nunca se vea como activo
- el CTA use la ruta de pago cuando corresponde
- el estado de WhatsApp se lea como:
  - registrado
  - activo
  - pendiente

### 3. `FirstActionChecklist`

Se corrigió la lógica de “listo”:

- WhatsApp solo queda listo si:
  - `welcome_sent = true`
  - o `activation_status = active`
- Google no queda listo en planes pagos hasta que `gate_allowed = true`
- cuando el plan está pendiente de pago, el primer paso visible pasa a ser completar el pago

### 4. Dashboard principal

Se simplificó la home del dashboard:

- se escondieron los bloques ruidosos de:
  - `Agenda Google`
  - `Drive visible`
  - `Resumen de tu perfil`
- se añadió una caja simple para `WhatsApp registrado`
- se mantuvo el enfoque en:
  - checklist
  - uso
  - siguientes acciones

### 5. Setup de registro

Se mejoró parcialmente el flujo de WhatsApp:

- ya existe preview normalizado del número en el resumen final
- el código de país queda disponible para una UX más clara en el setup

Queda pendiente una segunda pasada más limpia para dejar el input de teléfono totalmente local-first en todos los países sin residuos del placeholder heredado.

## Estados soportados

### Plan

- `active`
- `trialing`
- `pending_payment`
- `past_due`
- `canceled`
- `expired_trial`

### Pago

- `approved`
- `pending_payment`
- `pending`
- `failed`
- `canceled`

### WhatsApp

- `active`
- `pending`
- `attention`
- `missing_phone`
- `awaiting_plan`

## Campos backend requeridos

- `plan.status`
- `plan.code`
- `plan.subscription_status`
- `plan.gate_allowed`
- `payment.status`
- `payment.checkout_url`
- `whatsapp.phone`
- `whatsapp.normalized_phone`
- `whatsapp.activation_status`
- `whatsapp.welcome_sent`
- `google.connected`
- resumen de uso mensual

## Riesgos

- el setup de teléfono todavía conserva parte del flujo heredado y merece una limpieza final más profunda
- el estado de bienvenida depende de que backend persista correctamente `scheduled_messages` y/o `client_preferences`
- no se adjuntan screenshots en esta corrida local

## Decisión

`A) continue frontend hardening`

## Bloqueador exacto restante

El dashboard ya refleja mejor el estado real de plan/pago/WhatsApp, pero el input de teléfono del setup todavía conserva parte del comportamiento heredado y merece una segunda corrección aislada antes de considerarlo completamente certificado como UX pública final.
