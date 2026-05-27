# Operaly Alignment Handoff

## North Star / contrato vigente

- Operaly es un asistente personal operativo para personas ocupadas, especialmente profesionales.
- WhatsApp es el unico canal conversacional vivo.
- El dashboard web es administrativo, no conversacional.
- El backend es el cerebro operativo; Supabase es el system of record.
- `client_id` es la unidad oficial de aislamiento multi-tenant.
- Los planes comerciales canonicos son `trial`, `core`, `pro`, `pro_plus`.
- `owner`, `owner_unlimited` e `internal` son internos y no oferta comercial publica.

## Backend VPS ya confirmado

### P0-A endurecido

- `/billing/checkout` deriva `client_id` desde bearer token y rechaza overrides inseguros.
- `POST /api/mercadopago/webhook` valida firma y opera fail-closed.
- Activacion de pagos y add-ons con idempotencia usando `billing_intents` y `external_reference`.
- Agenda/tareas y callbacks mas tenant-safe bajo `client_id`.
- Cron con lease/claim por fila en recordatorios, recurring, scheduled messages y call jobs.
- Menos superficie de DEBUG/PII.
- Telnyx con validacion Ed25519 y `cryptography` ya incorporado.

### P0-B iniciado

- `client_preferences` ya tiene helper central y contrato runtime:
  - `client_id`
  - `pref_key`
  - `pref_value`
  - `source`
  - `updated_at`

### Siguiente bloque backend correcto

- Unificar `usage_monthly` como contrato runtime.
- Luego `clients/subscriptions/plan gate`.
- Luego `tenant_effective_limits`.
- Luego billing runtime/schema final.
- Luego automatizaciones mas ricas, Google real y bugs funcionales.

## Frontend ya consolidado en este repo

### Hecho previamente

- Dashboard profesional alineado al contrato y sin chat.
- `lib/plans.ts` centralizado con `trial/core/pro/pro_plus`.
- Pago frontend alineado al backend endurecido usando bearer token real.
- Shell del dashboard profesional rehecho.
- Eliminados `conversaciones` y `reservas`.
- Owner dashboard ya venia mostrando mas consumo, activity log y cambios reales de plan/status.

### Hecho en esta sesion

- Fuente unica owner para catalogo y metas:
  - `lib/owner-catalog.ts`
  - `lib/owner-console-server.ts`
- APIs nuevas:
  - `app/api/owner/catalog/route.ts`
  - `app/api/owner/targets/route.ts`
  - `app/api/catalog/route.ts`
- Owner dashboard:
  - catalogo editable de planes y add-ons desde UI
  - metas persistentes semana/mes
  - metricas ejecutivas reaccionando a ventas/utilidad/suscriptores objetivo
  - logout/configuracion owner dentro del panel
- Componentes nuevos:
  - `app/dashboard/owner/_components/OwnerCatalogManager.tsx`
  - `app/dashboard/owner/_components/OwnerTargetsManager.tsx`
- Professional analytics:
  - add-ons dinamicos desde `/api/catalog`
  - ya no depende del hardcode previo para la oferta
- Professional configuracion:
  - ya consume catalogo dinamico para mostrar planes/precios
- Owner payments metrics panel:
  - labels de items/funnel ya leen el catalogo dinamico

## Persistencia elegida en frontend para owner

- No se toco SQL remoto.
- El catalogo owner y las metas owner persisten en `client_preferences`.
- Keys activas:
  - `owner_console_catalog`
  - `owner_console_targets`
  - `owner_console_activity`

## Drift / riesgo residual actual

- No se pudo correr `tsc`, `npm` ni lint en este entorno porque no hay `node_modules` ni toolchain instalada.
- Quedan posibles hardcodes remanentes fuera de owner/professional principales.
- `supabase_setup.sql` sigue siendo artefacto legacy, no contrato actual.
- Backend y frontend ya estan mas alineados, pero el siguiente gran acople debe salir de `usage_monthly` y `tenant_effective_limits`.

## Prompt exacto para Codex en VPN - backend

```text
Quiero seguir con P0-B en Operaly.

Tarea:
Unificar el contrato operativo de usage_monthly para dejar un solo naming y una sola semántica vigente en runtime.

Contexto:
- El backend usa usage_monthly como pieza crítica para límites, billing, add-ons, voz, documentos y alerts.
- Hay drift detectado entre el backend y supabase_setup.sql.
- El backend usa period_month y contadores extendidos.
- El SQL legacy usa period_yyyymm y una versión más pobre de la tabla.
- No quiero aún una migración destructiva sobre producción.
- Primero quiero dejar el backend y el contrato operativo bien definidos.
- Frontend ya quedó preparado para consumir un catálogo owner dinámico y para depender de contratos más limpios de límites/uso; por eso usage_monthly es ahora el siguiente cuello de botella real.

Quiero que revises:
- usage_guard.py
- tenant_limits_engine.py
- mercadopago_engine.py
- main.py
- voice_service.py
- cualquier módulo que lea o escriba usage_monthly
- supabase_setup.sql
- docs/core-contract.md
- docs/schema-drift-inventory.md
- docs/p0-backlog.md
- docs/session-handoff.md

Haz lo siguiente:
1. Identifica todos los puntos reales del backend que leen o escriben usage_monthly.
2. Define y aplica un contrato operativo único para usage_monthly en runtime.
3. Si hace falta, crea helper o capa central de acceso.
4. Minimiza riesgo de seguir mezclando period_yyyymm con period_month y de contadores inconsistentes.
5. Actualiza documentación para reflejar el contrato operativo elegido.
6. No toques todavía SQL remoto.
7. No hagas cambios destructivos fuera de esta tarea.

Entregable:
- modifica el código directamente si hace falta
- al final dime:
  - archivos tocados
  - qué contrato operativo quedó vigente
  - qué mezclas eliminaste o redujiste
  - riesgo residual
  - qué debería hacerse después en Supabase/migraciones

Prioridad:
Alinear límites, billing, add-ons, voz y consumo operativo.
```

## Prompt exacto para continuar frontend después

```text
Retoma en el repo frontend de Operaly exactamente desde este estado.

Branch actual:
codex-owner-professional-dashboard-alignment

Contrato:
- No rehagas lo ya hecho
- Mantén owner como editor central de catálogo/metas
- Mantén professional consumiendo catálogo dinámico
- No conviertas el dashboard en chat
- No introduzcas nuevas fuentes de verdad paralelas

Estado ya implementado:
- API owner persistente para catálogo editable
- API owner persistente para metas semana/mes
- owner dashboard con edición real de catálogo y targets
- owner logout/configuración
- professional analytics consumiendo add-ons desde catálogo dinámico
- professional configuración consumiendo catálogo dinámico para planes
- owner payments metrics panel usando catálogo para labels de items

Siguiente bloque frontend:
1. Buscar y eliminar hardcodes remanentes de planes/add-ons/metas en owner/professional/business
2. Mejorar feedback UX de guardado/error/refresh en owner catalog y targets
3. Revisar si hay superficies de billing/settings todavía leyendo defaults estáticos
4. Si el entorno tiene node_modules, correr typecheck/lint y corregir
5. No abrir aún Google real ni automatizaciones ricas en frontend; eso depende del backend
```

## Orden recomendado de ejecución

1. Backend Codex VPN: `usage_monthly`.
2. Revisión rápida de impacto sobre límites reales y RPCs.
3. Frontend: limpieza final de hardcodes y validación técnica.
4. Luego `tenant_effective_limits` / plan gate.
5. Luego automatizaciones ricas y Google real.
