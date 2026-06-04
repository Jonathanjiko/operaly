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

Se revisó públicamente `https://operaly.app` / `https://www.operaly.app` y el sitio sigue mostrando contenido viejo en landing:

- Trial todavía muestra `100 contacts and 2 automations`
- Pro todavía muestra `60 min of voice and calls`
- en inglés sigue saliendo `Cobro real en soles` en vez de `Billed in soles`

Eso significa que, al momento de esta certificación:

- la capa de código ya está corregida;
- el build ya pasa;
- pero la producción pública todavía no refleja esos cambios.

Conclusión operativa:

- el problema residual ya no es frontend build;
- es verificación de deploy / branch de producción / caché de Vercel o dominio.

## 6. Decisión

### Estado recomendado

**A) continue frontend hardening**

Justificación:

- el build blocker quedó resuelto;
- el código candidato sí está listo;
- pero la verificación pública todavía no pasa porque `operaly.app` sigue sirviendo contenido desactualizado;
- por lo tanto todavía no se puede declarar “public launch candidate ready” con honestidad.

## 7. Riesgo residual

- el sitio público aún no refleja el estado corregido del repositorio;
- persiste el warning de `middleware` deprecado hacia `proxy`, pero no bloquea el lanzamiento;
- la calidad final del widget depende de que las envs de Vercel estén realmente presentes y correctas.

## 8. Próximo paso exacto

1. confirmar en Vercel que `Production Branch = main`
2. confirmar que el deployment actual incluye el commit más reciente de `main`
3. revisar `operaly.app` y `operaly.app?lang=en`
4. confirmar visualmente:
   - `Pro = 20 min`
   - FAQ correcta
   - label PEN por locale
5. autenticar sesión y validar `/api/dashboard/status` en dashboard real
