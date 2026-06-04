# FASE H.2.4 — Frontend Build & Public Launch UX Certification

Fecha: 2026-06-03  
Worktree: `repo-main-merge`  
Base revisada: commit `5dcf504`  

## Resumen ejecutivo

Se certificó la capa frontend para candidato de lanzamiento público con una corrección crítica adicional:

- se eliminó el bloqueo de build provocado por la inicialización temprana del cliente browser de Supabase durante prerender;
- se mantuvo la política de no inventar datos del dashboard;
- se añadieron estados seguros para cuando `/api/dashboard/status` no pueda confirmar Google, WhatsApp o consumo;
- el build de producción ahora completa correctamente en local.

## 1. Build blocker

### Causa exacta

El fallo de prerender de `/dashboard/professional/tareas` venía de:

- `lib/supabase.ts`
- `createBrowserClient(...)` ejecutado en import-time
- envs requeridas ausentes durante el build local:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` o fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Eso disparaba el error de `@supabase/ssr` antes de que la página pudiera caer en un estado seguro de carga/error.

### Fix aplicado

Se endureció `lib/supabase.ts` para:

- usar placeholders inocuos solo para evitar la explosión de prerender/import;
- dejar que los flujos reales fallen de forma controlada en runtime si las envs faltaran de verdad;
- no fabricar datos del dashboard.

Además:

- `FirstActionChecklist`
- `PlanStatusWidget`

ahora muestran estados seguros cuando `/api/dashboard/status` falla, en vez de presentar señales no verificadas como si fueran reales.

### Resultado

`npm run build` ahora termina correctamente.

## 2. Variables de entorno que deben existir en Vercel Production

### Frontend / browser client

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Fallback legacy aún tolerado:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### API route auth-bound

Para `GET /api/dashboard/status`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Verificación funcional del código

### Landing / pricing

Corregido y listo en código:

- label de soles por locale (`PEN_LABEL`)
- `Pro` ahora muestra `20 min`
- `Trial` ahora muestra `20 contactos`
- FAQ de Pro alineada a `20 minutos`

### Dashboard

Agregado:

- `components/dashboard/FirstActionChecklist.tsx`
- `components/dashboard/PlanStatusWidget.tsx`
- `app/api/dashboard/status/route.ts`
- `lib/dashboard-status.ts`

Integrado en:

- `app/dashboard/professional/page.tsx`
- `app/dashboard/professional/layout.tsx`

### Contrato de `/api/dashboard/status`

Devuelve:

- plan actual
- estado efectivo del plan
- fin de período
- consumo mensual de mensajes
- consumo mensual de llamadas/audio
- estado de Google
- productos Google conectados
- estado de WhatsApp

Lee de:

- `clients`
- `subscriptions`
- `usage_monthly`
- `google_connections`
- `plan_configs`

Compatibilidad legacy:

- soporta `period_month`
- soporta `period_yyyymm`

## 4. UX de lanzamiento: criterios

Un usuario nuevo ya puede entender mejor:

- plan actual
- trial y vigencia
- consumo del mes
- estado de WhatsApp
- estado de Google
- siguiente acción sugerida
- ruta de upgrade

### Checklist inicial

El checklist ayuda a completar:

1. revisar WhatsApp
2. conectar Google
3. crear la primera acción en agenda

Se oculta cuando:

- el usuario lo descarta localmente
- o los tres pasos ya están resueltos

### Estado de plan

El widget ahora comunica:

- activo vs vencido/cancelado
- mensajes usados / límite
- llamadas usadas / límite
- Google conectado o no
- WhatsApp conectado o no

Y si no puede verificar:

- muestra un estado seguro
- redirige a `Configuración` e `Integraciones`

## 5. Verificación de deployment

### Verificado localmente

- build de producción: OK
- `GET /api/dashboard/status`: implementado
- integración visual del dashboard: OK en código

### Verificación pública

Se verificó la producción real con Vercel CLI y `curl`:

- proyecto Vercel: `operaly`
- scope: `jarojas1688-9993s-projects`
- último deployment de producción inspeccionado:
  - `dpl_GWtJVWvQKLVY5GTuyxMQf45VPdzC`
  - aliasado a:
    - `https://operaly.app`
    - `https://www.operaly.app`
    - `https://operaly-git-main-jarojas1688-9993s-projects.vercel.app`

Hallazgo clave:

- no había branch equivocada ni dominio apuntando a otro proyecto;
- el dominio ya estaba sobre el deployment de producción correcto;
- la diferencia anterior vino de una lectura pública desactualizada y no del alias actual.

Validación pública confirmada en `https://www.operaly.app/?lang=en`:

- Trial: `20 contacts and 2 automations`
- Pro: `20 min of voice and calls`
- label PEN en inglés: `Billed in soles`
- ya no aparece `Cobro real en soles` en inglés

Validación adicional:

- `GET /api/dashboard/status` responde `401` sin auth pública, que es el comportamiento esperado para un endpoint protegido.

## 6. Decisión

### Estado recomendado

**B) frontend public launch candidate ready**

Justificación:

- el build blocker quedó resuelto;
- el deployment de producción correcto está activo;
- la landing pública ya sirve los strings corregidos;
- el dashboard nuevo tiene fallback seguro cuando backend/status no están disponibles;
- el endpoint protegido del widget ya está desplegado.

## 7. Riesgo residual

- el FAQ expandido no se verificó con interacción real de navegador dentro de esta corrida, aunque el contenido corregido sí está en el código desplegado;
- persiste el warning de `middleware` deprecado hacia `proxy`, pero no bloquea el lanzamiento;
- la calidad final del widget depende de que las envs de Vercel estén realmente presentes y correctas.

## 8. Próximo paso exacto

1. abrir sesión real en producción
2. validar el widget de plan dentro del dashboard autenticado
3. validar checklist inicial en cuenta nueva
4. revisar luego la migración futura de `middleware` → `proxy`
