# H.2.6.2 — Phone Input Local-First Finalization

## Objetivo

Cerrar el flujo de registro de telefono para lanzamiento publico internacional, evitando numeros malformados y haciendo que el usuario escriba solo su numero local.

## Cambios aplicados

- Se reescribio `app/register/setup/SetupClient.tsx`.
- El usuario ahora:
  - elige pais
  - ve el dial code aplicado automaticamente
  - escribe solo el numero local
  - ve el preview E.164 antes de confirmar
- Si el usuario pega un numero completo con `+51`, `+52`, etc., el sistema extrae la parte local y evita duplicar el codigo.
- El backend solo recibe `phone_normalized` despues de validar longitud y pais.

## Paises cubiertos

Incluye, entre otros:

- Peru
- Mexico
- Colombia
- Chile
- Argentina
- Estados Unidos
- Espana
- Ecuador
- Bolivia
- Paraguay
- Uruguay
- Venezuela
- Canada
- Reino Unido
- Brasil
- Francia
- Alemania
- Italia
- Portugal
- Paises Bajos
- Australia
- Japon
- Corea del Sur
- India
- China
- Emiratos Arabes Unidos
- Arabia Saudita
- Sudafrica
- Turquia
- Rusia

## Reglas soportadas

- Peru +51 + `944793144` -> `+51944793144`
- Mexico +52 -> preview y normalizacion local
- Colombia +57 -> preview y normalizacion local
- Chile +56 -> preview y normalizacion local
- Argentina +54 -> preview y normalizacion local
- USA +1 -> preview y normalizacion local
- Espana +34 -> preview y normalizacion local

## Integridad

- No se envian numeros sin validar al backend.
- Si la longitud local no coincide con el pais, se muestra error claro.
- El resumen final muestra el numero normalizado si ya es valido.
- Si existe un `phone_normalized` en metadata de sesion, el formulario intenta reflejarlo al editar.

## Riesgos residuales

- La inferencia automatica por ciudad todavia no cambia el pais; se mantiene la cookie y metadata como fuentes suaves.
- Para casos exoticos fuera del catalogo actual, habria que ampliar el mapa de paises y longitudes.

## Decision

`B) phone input ready for public onboarding`
