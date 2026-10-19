# BiVelio — Twenty v2.45.0 (rama `bivelio/v2.45.0`)

Este fork público es la oferta de código fuente de la GNU AGPL-3.0 (§13) para quien usa el CRM de BiVelio One
(crm.one.bivelio.com, «CRM by BiVelio»). Esta rama contiene el código exacto de la versión que corre.

## Qué versión es

- Base: el tag del upstream `twenty/v2.45.0` (`7e1431c84adbb264db98ab8b8d008a8401b6d4d6`) de
  [twentyhq/twenty](https://github.com/twentyhq/twenty), sin tocar el código salvo lo que se lista abajo.
- Sin la CI del upstream (`.github/workflows` de twentyhq: despliegues, revisiones y traducciones que usan sus secretos
  y sus repositorios). La única CI es `.github/workflows/imagen-bivelio.yml`.

## Qué cambia BiVelio

| Dónde | Qué | Decisión |
|---|---|---|
| `packages/twenty-server/src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes.ts` | Al conectar una cuenta de Google ya no se piden los permisos de enviar ni de redactar correo de Gmail: solo leer el correo (`gmail.readonly`) y los eventos del calendario (`calendar.events`), más `email`, `profile` y `profile.emails.read`. Es también la lista que Twenty compara con el token, así que una cuenta con solo esos permisos es válida. El CRM no puede enviar ni redactar correo en nombre de nadie | crm-4 |
| `.../auth/services/google-apis-scopes.service.util.spec.ts` y `test/integration/google/mocks/google-oauth-scopes.constant.ts` | Las pruebas, con la lista nueva (y una que exige exactamente esa lista) | crm-4 |
| `bivelio/edge/` | La marca «CRM by BiVelio»: no está en el código de Twenty, la añade el proxy de delante (Caddy) en cada respuesta. `caddy.snippet` (sustituciones de textos e iconos y cabeceras) y `theme/` (CSS, JS, iconos y fuentes OFL con su licencia). Sin secretos | crm-1 |
| `.github/workflows/imagen-bivelio.yml` | Construye la imagen con el Dockerfile del propio Twenty y la publica en `ghcr.io/bivelio/twenty` | crm-1 |

Los parches de código también están en el repositorio de BiVelio One (`infra/crm/fork/*.patch`), de donde salen.

## Imagen

`ghcr.io/bivelio/twenty:v2.45.0-bivelio`, target `twenty` de `packages/twenty-docker/twenty/Dockerfile`, solo
`linux/amd64`. Cada árbol de código tiene además su etiqueta inmutable `v2.45.0-bivelio-arbol-<12 hex>`; la PR publica
esa y al fusionar se le pone `v2.45.0-bivelio` sin volver a construir (mismo digest). El workflow comprueba antes de
publicar que ningún fichero del servidor compilado contiene `gmail.send` y que la lista de scopes es la de solo lectura.

BiVelio One la usa siempre fijada por digest (`infra/prod/crm/compose.yml`, `x-twenty-image-fork`) y solo con
`CRM_IMAGEN_FORK=1`; sin eso corre la imagen oficial `twentycrm/twenty:v2.45.0`, cuyo código es el de esta rama sin
el cambio de scopes.

## Dónde se despliega

Servidor de motores de BiVelio One (Hetzner, UE), detrás del edge de One. Solo para BiVelio y sus clientes de One.

## En cada actualización de Twenty

Rama nueva `bivelio/<versión>` desde el tag nuevo, volver a aplicar los parches y copiar la marca del edge
(`infra/crm/fork/README.md` de BiVelio One). Esta rama no se reescribe.
